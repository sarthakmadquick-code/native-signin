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

type FieldName = "email" | "password";
type Errors = Partial<Record<FieldName, string>>;

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
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Enter your details to continue to your account.
            </Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Email"
              error={errors.email}
              inputProps={{
                value: email,
                onChangeText: (v) => {
                  setEmail(v);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                },
                onBlur: () => setErrors(validate()),
                placeholder: "you@example.com",
                keyboardType: "email-address",
                autoCapitalize: "none",
                autoComplete: "email",
                textContentType: "emailAddress",
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
                placeholder: "••••••••",
                secureTextEntry: secure,
                autoCapitalize: "none",
                autoComplete: "password",
                textContentType: "password",
                returnKeyType: "go",
                onSubmitEditing: handleSubmit,
              }}
              accessory={
                <Pressable
                  onPress={() => setSecure((s) => !s)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={secure ? "Show password" : "Hide password"}
                >
                  <Text style={styles.link}>{secure ? "Show" : "Hide"}</Text>
                </Pressable>
              }
            />

            <Pressable style={styles.forgot}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>

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

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable style={styles.secondary} accessibilityRole="button">
              <Text style={styles.secondaryText}>Continue with Google</Text>
            </Pressable>

            <Text style={styles.footer}>
              Don&apos;t have an account? <Text style={styles.link}>Create one</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  accessory?: React.ReactNode;
  inputRef?: React.RefObject<TextInput | null>;
  inputProps: React.ComponentProps<typeof TextInput>;
};

function Field({ label, error, accessory, inputRef, inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {accessory}
      </View>
      <TextInput
        ref={inputRef}
        placeholderTextColor="#9AA0A6"
        style={[styles.input, error ? styles.inputError : null]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6F8" },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: { marginBottom: 32 },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#6B7280",
    marginBottom: 8,
  },
  title: { fontSize: 34, fontWeight: "700", color: "#111827"},
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 8, lineHeight: 22 },
  form: { gap: 16 },
  field: { gap: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151" },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
  },
  inputError: { borderColor: "#DC2626" },
  error: { fontSize: 12, color: "#DC2626" },
  link: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
  forgot: { alignSelf: "flex-end", marginTop: -4 },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { backgroundColor: "#9CA3AF" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  divider: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { fontSize: 12, color: "#9CA3AF" },
  secondary: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  footer: { textAlign: "center", fontSize: 14, color: "#6B7280", marginTop: 8 },
});