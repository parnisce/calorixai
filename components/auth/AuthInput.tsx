import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
    icon: any;
    error?: string;
    isPassword?: boolean;
}

export default function AuthInput({ icon: Icon, error, isPassword, ...props }: AuthInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

    return (
        <View style={styles.container}>
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error && styles.inputContainerError
            ]}>
                <Icon size={20} color={isFocused ? '#6366f1' : '#9ca3af'} style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                        <Text style={styles.eyeText}>{isPasswordVisible ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputContainerFocused: {
        borderColor: '#6366f1',
        backgroundColor: '#f5f7ff',
    },
    inputContainerError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontFamily: 'System',
    },
    eyeIcon: {
        padding: 8,
    },
    eyeText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 16,
    }
});
