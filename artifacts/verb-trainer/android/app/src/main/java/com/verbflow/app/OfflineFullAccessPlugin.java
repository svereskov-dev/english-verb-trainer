package com.verbflow.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClient.BillingResponseCode;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryPurchasesParams;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "OfflineFullAccess")
public class OfflineFullAccessPlugin extends Plugin {

    private static final String FULL_ACCESS_PRODUCT_ID = "full_access";
    private static final String KEY_ALIAS = "verbflow_full_access";
    private static final String PREFERENCES_NAME = "verbflow_offline_entitlements";
    private static final String CIPHERTEXT_KEY = "full_access_ciphertext";
    private static final String IV_KEY = "full_access_iv";
    private static final int FORMAT_VERSION = 1;
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;
    private static final byte[] GRANT_MARKER = "full_access_granted".getBytes(StandardCharsets.UTF_8);

    @PluginMethod
    public void getFullAccess(PluginCall call) {
        boolean granted = false;
        try {
            granted = readGrant();
        } catch (Exception ignored) {
            clearStoredGrant();
        }

        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void refreshFullAccess(PluginCall call) {
        final BillingClient billingClient;
        try {
            billingClient = BillingClient.newBuilder(getContext())
                    .setListener(new PurchasesUpdatedListener() {
                        @Override
                        public void onPurchasesUpdated(
                                @NonNull BillingResult billingResult,
                                List<Purchase> purchases
                        ) {
                            // This temporary client is used only for ownership queries.
                        }
                    })
                    .enablePendingPurchases(
                            PendingPurchasesParams.newBuilder()
                                    .enableOneTimeProducts()
                                    .build()
                    )
                    .enableAutoServiceReconnection()
                    .build();
        } catch (Exception error) {
            call.reject("Unable to set up Google Play Billing.", error);
            return;
        }

        try {
            billingClient.startConnection(new BillingClientStateListener() {
                @Override
                public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                    if (billingResult.getResponseCode() != BillingResponseCode.OK) {
                        finishBillingClient(billingClient);
                        call.reject("Google Play Billing setup failed.", billingResult.getDebugMessage());
                        return;
                    }

                    try {
                        billingClient.queryPurchasesAsync(
                                QueryPurchasesParams.newBuilder()
                                        .setProductType(BillingClient.ProductType.INAPP)
                                        .build(),
                                (queryResult, purchases) -> {
                                    if (queryResult.getResponseCode() != BillingResponseCode.OK) {
                                        finishBillingClient(billingClient);
                                        call.reject(
                                                "Google Play ownership query failed.",
                                                queryResult.getDebugMessage()
                                        );
                                        return;
                                    }

                                    boolean granted = ownsFullAccess(purchases);
                                    try {
                                        if (granted) {
                                            writeGrant();
                                        } else if (!clearStoredGrant()) {
                                            throw new GeneralSecurityException(
                                                    "Unable to clear Full Access entitlement."
                                            );
                                        }

                                        JSObject result = new JSObject();
                                        result.put("granted", granted);
                                        finishBillingClient(billingClient);
                                        call.resolve(result);
                                    } catch (Exception error) {
                                        finishBillingClient(billingClient);
                                        call.reject(
                                                "Unable to persist Full Access entitlement.",
                                                error
                                        );
                                    }
                                }
                        );
                    } catch (Exception error) {
                        finishBillingClient(billingClient);
                        call.reject("Google Play ownership query failed.", error);
                    }
                }

                @Override
                public void onBillingServiceDisconnected() {
                    // BillingClient auto-reconnection remains enabled. A transient
                    // disconnect must not change the persisted entitlement.
                }
            });
        } catch (Exception error) {
            finishBillingClient(billingClient);
            call.reject("Google Play Billing setup failed.", error);
        }
    }

    @PluginMethod
    public void clearFullAccess(PluginCall call) {
        if (!clearStoredGrant()) {
            call.reject("Unable to clear Full Access entitlement.");
            return;
        }
        JSObject result = new JSObject();
        result.put("granted", false);
        call.resolve(result);
    }

    private boolean readGrant() throws GeneralSecurityException {
        SharedPreferences preferences = preferences();
        if (!preferences.contains("format_version")
                || preferences.getInt("format_version", 0) != FORMAT_VERSION) {
            clearStoredGrant();
            return false;
        }

        String encodedCiphertext = preferences.getString(CIPHERTEXT_KEY, null);
        String encodedIv = preferences.getString(IV_KEY, null);
        if (encodedCiphertext == null || encodedIv == null) {
            clearStoredGrant();
            return false;
        }

        byte[] ciphertext = Base64.decode(encodedCiphertext, Base64.NO_WRAP);
        byte[] iv = Base64.decode(encodedIv, Base64.NO_WRAP);
        if (iv.length != IV_LENGTH_BYTES) {
            throw new GeneralSecurityException("Invalid entitlement IV.");
        }

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, getKey(), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
        byte[] marker = cipher.doFinal(ciphertext);
        boolean valid = constantTimeEquals(GRANT_MARKER, marker);
        if (!valid) {
            clearStoredGrant();
        }
        return valid;
    }

    private void writeGrant() throws GeneralSecurityException {
        byte[] iv = new byte[IV_LENGTH_BYTES];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, getKey(), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
        byte[] ciphertext = cipher.doFinal(GRANT_MARKER);

        boolean committed = preferences().edit()
                .putInt("format_version", FORMAT_VERSION)
                .putString(CIPHERTEXT_KEY, Base64.encodeToString(ciphertext, Base64.NO_WRAP))
                .putString(IV_KEY, Base64.encodeToString(iv, Base64.NO_WRAP))
                .commit();
        if (!committed) {
            throw new GeneralSecurityException("Unable to commit entitlement.");
        }
    }

    private SecretKey getKey() throws GeneralSecurityException {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if (keyStore.containsAlias(KEY_ALIAS)) {
            java.security.Key key = keyStore.getKey(KEY_ALIAS, null);
            if (key instanceof SecretKey) {
                return (SecretKey) key;
            }
            throw new GeneralSecurityException("Invalid entitlement key.");
        }

        KeyGenerator keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
        );
        keyGenerator.init(new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build());
        return keyGenerator.generateKey();
    }

    @NonNull
    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE);
    }

    private boolean clearStoredGrant() {
        try {
            return preferences().edit()
                    .remove("format_version")
                    .remove(CIPHERTEXT_KEY)
                    .remove(IV_KEY)
                    .commit();
        } catch (Exception ignored) {
            // A corrupt or unreadable preference must never crash the WebView.
            return false;
        }
    }

    private static boolean ownsFullAccess(List<Purchase> purchases) {
        if (purchases == null) {
            return false;
        }
        for (Purchase purchase : purchases) {
            if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
                continue;
            }
            if (purchase.getProducts().contains(FULL_ACCESS_PRODUCT_ID)) {
                return true;
            }
        }
        return false;
    }

    private static void finishBillingClient(BillingClient billingClient) {
        try {
            billingClient.endConnection();
        } catch (Exception ignored) {
            // The ownership result has already been determined; cleanup is best-effort.
        }
    }

    private static boolean constantTimeEquals(byte[] first, byte[] second) {
        if (first == null || second == null || first.length != second.length) {
            return false;
        }
        int difference = 0;
        for (int index = 0; index < first.length; index++) {
            difference |= first[index] ^ second[index];
        }
        return difference == 0;
    }
}