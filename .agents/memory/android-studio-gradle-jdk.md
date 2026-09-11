---
name: Android Studio Gradle JDK
description: Portable handling for Android Studio's project-local Gradle JDK setting.
---

Android Studio's `#GRADLE_LOCAL_JAVA_HOME` setting resolves through
`android/.gradle/config.properties`, whose `java.home` value is machine-specific.
Do not commit or distribute an absolute JDK path. Generate the ignored mapping
from an available Java 21 installation during Android setup, and keep a manual
fallback instructing users to select Android Studio's Embedded JDK.

**Why:** A source archive that omits the local `.gradle` directory can open with
“Invalid Gradle JDK configuration” even though the Gradle project files are valid.
This project uses Java 21 source compatibility, so JDK 17 is insufficient.

**How to apply:** For portable Capacitor Android archives, detect `JAVA_HOME`,
the system Java installation, and common Android Studio embedded-JDK locations;
write only the local ignored mapping when a Java 21 JDK is found.