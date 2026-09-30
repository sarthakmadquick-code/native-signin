import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRAND = "#8BC34A";
const BRAND_DARK = "#6FA233";
const INK = "#1A1A1A";
const MUTED = "#8A8A8A";
const FIELD_BG = "#F7F7F7";
const BORDER = "#E6E6E6";
const BORDER_FOCUS = "#C6E39B";

type FieldName = "email" | "password";
type Errors = Partial<Record<FieldName, string>>;

/** Four rotated petals + centre dot, drawn with plain Views (no icon library). */
function LogoMark({ size = 44 }: { size?: number }) {
  const petal = size * 0.34;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {[0, 90, 180, 270].map((deg) => (
        <View
          key={deg}
          style={{
            position: "absolute",
            width: petal,
            height: petal,
            borderRadius: petal / 2,
            backgroundColor: BRAND,
            transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.22 }],
          }}
        />
      ))}
      <View
        style={{
          width: size * 0.18,
          height: size * 0.18,
          borderRadius: size * 0.09,
          backgroundColor: BRAND_DARK,
        }}
      />
    </View>
  );
}

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = useMemo(
    () => EMAIL_RE.test(email.trim()) && password.length > 0 && !submitting,
    [email, password, submitting]
  );

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Use at least 6 characters";
    return next;
  }

  function handleSubmit() {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    // TODO: replace with your auth call
    setTimeout(() => {
      setSubmitting(false);
      setPassword("");
    }, 1200);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <LogoMark />
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Let&apos;s experience the joy of telecare AI.</Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Email Address"
              error={errors.email}
              left={<Text style={styles.fieldIcon}>{"✉"}</Text>}
              inputProps={{
                value: email,
                onChangeText: (v) => {
                  setEmail(v);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                },
                onBlur: () => setErrors(validate()),
                placeholder: "you@gmail.com",
                keyboardType: "email-address",
                autoCapitalize: "none",
                autoComplete: "email",
                returnKeyType: "next",
                onSubmitEditing: () => passwordRef.current?.focus(),
              }}
            />

            <Field
              label="Password"
              error={errors.password}
              inputRef={passwordRef}
              inputProps={{
                value: password,
                onChangeText: (v) => {
                  setPassword(v);
                  if (errors.password)
                    setErrors((e) => ({ ...e, password: undefined }));
                },
                onBlur: () => setErrors(validate()),
                placeholder: "Enter your password...",
                secureTextEntry: secure,
                autoCapitalize: "none",
                autoComplete: "password",
                textContentType: "password",
                returnKeyType: "go",
                onSubmitEditing: handleSubmit,
              }}
              left={<LockGlyph />}
              accessory={
                <Pressable
                  onPress={() => setSecure((s) => !s)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={secure ? "Show password" : "Hide password"}
                >
                  <Text style={styles.fieldIcon}>
                    {secure ? "◐" : "◉"}
                  </Text>
                </Pressable>
              }
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && canSubmit && styles.buttonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>

            <View style={styles.socialRow}>
              <SocialButton label="f" />
              <SocialButton label="G" />
              <SocialButton label="◉" />
            </View>

            <Text style={styles.footer}>
              Don&apos;t have an account? <Text style={styles.link}>Sign Up.</Text>
            </Text>
            <Pressable style={styles.forgotWrap} accessibilityRole="button">
              <Text style={styles.link}>Forgot your password?</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Small padlock drawn with Views — body, shackle arc, keyhole. */
function LockGlyph() {
  return (
    <View style={styles.lock}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody}>
        <View style={styles.lockKeyhole} />
      </View>
    </View>
  );
}

function SocialButton({ label }: { label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.socialBtn, pressed && styles.buttonPressed]}
    >
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  accessory?: React.ReactNode;
  left?: React.ReactNode;
  inputRef?: React.RefObject<TextInput | null>;
  inputProps: React.ComponentProps<typeof TextInput>;
};

function Field({ label, error, accessory, left, inputRef, inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputWrap, error ? styles.inputError : null]}
      >
        {left ? <View style={styles.leftSlot}>{left}</View> : null}
        <TextInput
          ref={inputRef}
          placeholderTextColor={MUTED}
          style={styles.input}
          {...inputProps}
        />
        {accessory ? <View style={styles.rightSlot}>{accessory}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  header: { alignItems: "center", marginBottom: 26 },
  title: { fontSize: 28, fontWeight: "700", color: INK, marginTop: 14 },
  subtitle: { fontSize: 13, color: MUTED, marginTop: 6, textAlign: "center" },
  form: { gap: 18 },
  field: { gap: 7 },
  label: { fontSize: 12, fontWeight: "600", color: INK },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: FIELD_BG,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: "#E5484D" },
  leftSlot: { marginRight: 10 },
  rightSlot: { marginLeft: 10 },
  input: { flex: 1, fontSize: 14, color: INK, padding: 0 },
  error: { fontSize: 12, color: "#E5484D" },
  fieldIcon: { fontSize: 15, color: "#5A5A5A" },
  eye: { fontSize: 14 },
  lock: { width: 16, height: 18, alignItems: "center", justifyContent: "flex-end" },
  lockShackle: {
    width: 9,
    height: 9,
    borderWidth: 1.6,
    borderColor: "#5A5A5A",
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  lockBody: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#5A5A5A",
    alignItems: "center",
    justifyContent: "center",
  },
  lockKeyhole: {
    width: 2,
    height: 4,
    borderRadius: 1,
    backgroundColor: FIELD_BG,
  },
  button: {
    height: 50,
    borderRadius: 26,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { backgroundColor: "#BFDCA0" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 4,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: { fontSize: 17, fontWeight: "700", color: INK },
  link: { color: BRAND_DARK, fontWeight: "600" },
  footer: { textAlign: "center", fontSize: 13, color: "#5A5A5A", marginTop: 2 },
  forgotWrap: { alignItems: "center" },
});