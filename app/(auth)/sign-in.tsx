import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { saveUserToFirestore } from '../../utils/firestore';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (completeSignIn.status === 'complete') {
                await setActive({ session: completeSignIn.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(completeSignIn, null, 2));
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors?.[0]?.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignInPress = async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startGoogleFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                // Save to Firestore if it's a new or existing user
                const isSignUp = !!signUp?.createdUserId;
                const userId = signUp?.createdUserId || (signIn?.userData as any)?.id || signIn?.createdSessionId;

                if (userId) {
                    await saveUserToFirestore({
                        id: userId,
                        email: signUp?.emailAddress || (signIn?.userData as any)?.emailAddress || null,
                        firstName: signUp?.firstName || (signIn?.userData as any)?.firstName || null,
                        lastName: signUp?.lastName || (signIn?.userData as any)?.lastName || null,
                        createdAt: new Date(),
                    });
                }
                router.replace('/');
            } else {
                // Use signIn or signUp for next steps such as MFA
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
                <View style={styles.header}>
                    <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>

                    {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

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

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <AuthButton
                        title="Sign In"
                        onPress={onSignInPress}
                        loading={loading}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    <AuthButton
                        title="Continue with Google"
                        variant="social"
                        icon={<Image source={require('../../assets/images/partial-react-logo.png')} style={{ width: 24, height: 24 }} />} // placeholder for google icon
                        onPress={onGoogleSignInPress}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/sign-up" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
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
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
        backgroundColor: '#f8fafc',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 30, // assuming icon has standard styling
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 32,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        color: '#ef4444',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 14,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#6366f1',
        fontWeight: '600',
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
        marginTop: 40,
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
    }
});
