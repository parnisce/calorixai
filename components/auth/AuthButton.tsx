import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'social';
    icon?: React.ReactNode;
}

export default function AuthButton({ title, onPress, loading, variant = 'primary', icon }: AuthButtonProps) {
    if (variant === 'social') {
        return (
            <TouchableOpacity
                style={styles.socialButton}
                onPress={onPress}
                disabled={loading}
                activeOpacity={0.7}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={styles.socialText}>{title}</Text>
                {loading && <ActivityIndicator color="#1f2937" style={styles.loader} />}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.primaryText}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    primaryButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    socialButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginTop: 16,
    },
    socialText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    iconContainer: {
        marginRight: 12,
    },
    loader: {
        marginLeft: 8,
    }
});
