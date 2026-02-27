import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { saveUserToFirestore } from '../../utils/firestore';

export default function SignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            await signUp.create({
                emailAddress,
                password,
                firstName,
                lastName,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors?.[0]?.message || 'Failed to sign up.');
        } finally {
            setLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });

                // Save user to firestore upon complete sign up
                await saveUserToFirestore({
                    id: completeSignUp.createdUserId as string,
                    email: emailAddress,
                    firstName: firstName,
                    lastName: lastName,
                    createdAt: new Date(),
                });

                router.replace('/');
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors?.[0]?.message || 'Failed to verify.');
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignUpPress = async () => {
        try {
            const { createdSessionId, signUp, setActive } = await startGoogleFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                if (signUp?.createdUserId) {
                    await saveUserToFirestore({
                        id: signUp.createdUserId,
                        email: signUp.emailAddress,
                        firstName: signUp.firstName,
                        lastName: signUp.lastName,
                        createdAt: new Date(),
                    });
                }
                router.replace('/');
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!pendingVerification ? (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Start tracking your calories today!</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

                            <View style={styles.row}>
                                <View style={[styles.flex1, { marginRight: 8 }]}>
                                    <AuthInput
                                        icon={User}
                                        placeholder="First Name"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                    />
                                </View>
                                <View style={[styles.flex1, { marginLeft: 8 }]}>
                                    <AuthInput
                                        icon={User}
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChangeText={setLastName}
                                    />
                                </View>
                            </View>

                            <AuthInput
                                icon={Mail}
                                placeholder="Email address"
                                value={emailAddress}
                                onChangeText={setEmailAddress}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <AuthInput
                                icon={Lock}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                isPassword
                            />

                            <AuthButton
                                title="Create Account"
                                onPress={onSignUpPress}
                                loading={loading}
                            />

                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.divider} />
                            </View>

                            <AuthButton
                                title="Sign up with Google"
                                variant="social"
                                icon={<Image source={require('../../assets/images/partial-react-logo.png')} style={{ width: 24, height: 24 }} />}
                                onPress={onGoogleSignUpPress}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <Link href="/sign-in" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.footerLink}>Sign In</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={[styles.formContainer, styles.verifyContainer]}>
                        <Image source={require('../../assets/images/icon.png')} style={styles.verifyLogo} />
                        <Text style={styles.title}>Verify your email</Text>
                        <Text style={styles.subtitle}>We sent a code to {emailAddress}</Text>

                        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

                        <AuthInput
                            icon={Lock}
                            placeholder="Verification Code"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                        />

                        <AuthButton
                            title="Verify Email"
                            onPress={onPressVerify}
                            loading={loading}
                        />

                        <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.backButton}>
                            <Text style={styles.backButtonText}>Back to Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 80,
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 8,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    row: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        color: '#ef4444',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 14,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9ca3af',
        fontWeight: '600',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 15,
    },
    footerLink: {
        color: '#6366f1',
        fontWeight: '700',
        fontSize: 15,
    },
    verifyContainer: {
        paddingTop: 80,
        alignItems: 'center',
    },
    verifyLogo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        marginBottom: 32,
    },
    backButton: {
        marginTop: 24,
    },
    backButtonText: {
        color: '#6b7280',
        fontSize: 15,
        fontWeight: '600',
    }
});
