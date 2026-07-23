package com.verbtrainer.app;

import android.content.Context;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;

import com.getcapacitor.CapacitorWebView;

/**
 * Custom WebView that removes the number row from the Android keyboard for
 * text inputs, matching the behaviour of native Android apps like ConjuGato.
 *
 * Root cause
 * ----------
 * Chrome (Chromium's ImeUtils.java, computeEditorInfo()) hardcodes:
 *
 *     outAttrs.inputType =
 *         TYPE_CLASS_TEXT | TYPE_TEXT_VARIATION_WEB_EDIT_TEXT;
 *
 * for EVERY web text input, regardless of HTML type/inputmode attributes.
 * Many Android keyboards (MIUI, Samsung, Gboard) see WEB_EDIT_TEXT (0xa0)
 * and add a number row, assuming the user is in a web browser and needs
 * digits. Native apps receive TYPE_TEXT_VARIATION_NORMAL (0x00) instead,
 * which keyboards treat as a regular text field — no number row.
 *
 * Fix
 * ---
 * After the super call sets WEB_EDIT_TEXT, we strip it and replace it with
 * TYPE_TEXT_VARIATION_NORMAL. Every keyboard that relies on this flag will
 * then render the compact, letter-only layout.
 *
 * Install
 * -------
 * 1. Copy this file to:
 *    android/app/src/main/java/com/verbtrainer/app/NoNumberRowWebView.java
 *
 * 2. Copy capacitor_bridge_layout_main.xml to:
 *    android/app/src/main/res/layout/capacitor_bridge_layout_main.xml
 *    (app resources override Capacitor's library resource of the same name)
 *
 * That's it — no changes to MainActivity.java are required.
 */
public class NoNumberRowWebView extends CapacitorWebView {

    public NoNumberRowWebView(Context context) {
        super(context, null);
    }

    public NoNumberRowWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    @Override
    public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
        InputConnection ic = super.onCreateInputConnection(outAttrs);

        if (outAttrs != null) {
            int variation = outAttrs.inputType & InputType.TYPE_MASK_VARIATION;
            if (variation == InputType.TYPE_TEXT_VARIATION_WEB_EDIT_TEXT) {
                // Replace WEB_EDIT_TEXT with NORMAL so keyboards show the
                // compact layout (no number row), matching native app behaviour.
                outAttrs.inputType =
                        (outAttrs.inputType & ~InputType.TYPE_MASK_VARIATION)
                        | InputType.TYPE_TEXT_VARIATION_NORMAL;
            }
        }

        return ic;
    }
}
