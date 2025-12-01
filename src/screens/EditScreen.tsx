import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { addPlant, updatePlant } from '../services/plantService';
import { SolarPlant } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export default function EditScreen({ route, navigation }: Props) {
    const { plant } = route.params;
    const { user } = useAuth();
    const isEditing = !!plant;

    const [formData, setFormData] = useState<Partial<SolarPlant>>(plant || {});
    const [loading, setLoading] = useState(false);

    // Check permissions
    const canEdit = user?.role === 'admin' || user?.role === 'editor';

    if (!canEdit) {
        return (
            <View style={styles.container}>
                <Text style={styles.noAccess}>You don't have permission to edit plants.</Text>
            </View>
        );
    }

    const handleChange = (key: keyof SolarPlant, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert("Name is required");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && plant?.id) {
                await updatePlant(plant.id, formData);
            } else {
                await addPlant(formData as SolarPlant);
            }
            navigation.goBack();
        } catch (error: any) {
            console.error(error);
            alert("Error saving plant: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                    <Text style={styles.sectionHeader}>Basic Info</Text>
                    <InputField
                        label="Plant Name *"
                        value={formData.name}
                        onChangeText={(text: string) => handleChange('name', text)}
                        placeholder="e.g. Sunny Side Up"
                    />
                    <InputField
                        label="Address"
                        value={formData.address}
                        onChangeText={(text: string) => handleChange('address', text)}
                        placeholder="123 Solar Lane"
                    />
                    <InputField
                        label="Capacity (KW)"
                        value={formData.capacityKW}
                        onChangeText={(text: string) => handleChange('capacityKW', text)}
                        placeholder="5.5"
                        keyboardType="numeric"
                    />

                    <Text style={styles.sectionHeader}>Equipment Installed</Text>
                    {(formData.inverters || []).map((inverter, index) => (
                        <View key={index} style={styles.inverterContainer}>
                            <View style={styles.inverterHeader}>
                                <Text style={styles.inverterTitle}>Inverter {index + 1}</Text>
                                <TouchableOpacity onPress={() => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters.splice(index, 1);
                                    handleChange('inverters', newInverters as any);
                                }}>
                                    <Text style={styles.removeText}>Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <InputField
                                label="Brand"
                                value={inverter.brand}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], brand: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="e.g. SMA, Fronius"
                            />
                            <InputField
                                label="Size"
                                value={inverter.size}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], size: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="e.g. 5kW"
                            />
                            <InputField
                                label="WPA-PSK"
                                value={inverter.wpaPsk}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], wpaPsk: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="WPA Key"
                            />
                            <InputField
                                label="Serial Number"
                                value={inverter.serial}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], serial: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="SN12345678"
                            />
                            <InputField
                                label="IP Address"
                                value={inverter.ip}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], ip: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="192.168.1.100"
                            />
                            <InputField
                                label="Username"
                                value={inverter.username}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], username: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="admin"
                            />
                            <InputField
                                label="Password"
                                value={inverter.password}
                                onChangeText={(text: string) => {
                                    const newInverters = [...(formData.inverters || [])];
                                    newInverters[index] = { ...newInverters[index], password: text };
                                    handleChange('inverters', newInverters as any);
                                }}
                                placeholder="password"
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            const newInverters = [...(formData.inverters || []), {}];
                            handleChange('inverters', newInverters as any);
                        }}
                    >
                        <Text style={styles.addButtonText}>+ Add Equipment</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionHeader}>Network</Text>
                    <InputField
                        label="WiFi SSID"
                        value={formData.wifiSsid}
                        onChangeText={(text: string) => handleChange('wifiSsid', text)}
                        placeholder="MyWiFi"
                    />
                    <InputField
                        label="WiFi Password"
                        value={formData.wifiPassword}
                        onChangeText={(text: string) => handleChange('wifiPassword', text)}
                        placeholder="secret123"
                    />

                    <Text style={styles.sectionHeader}>Data Logger</Text>
                    <InputField
                        label="Username"
                        value={formData.dataLoggerUsername}
                        onChangeText={(text: string) => handleChange('dataLoggerUsername', text)}
                        placeholder="admin"
                    />
                    <InputField
                        label="Password"
                        value={formData.dataLoggerPassword}
                        onChangeText={(text: string) => handleChange('dataLoggerPassword', text)}
                        placeholder="password"
                    />

                    <Text style={styles.sectionHeader}>Notes</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.notes || ''}
                            onChangeText={(text) => handleChange('notes', text)}
                            placeholder="Additional details..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>{isEditing ? "Update Plant" : "Add Plant"}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false }: any) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value?.toString() || ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        padding: 15,
    },
    form: {
        paddingBottom: 40,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginTop: 20,
        marginBottom: 10,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    disabledButton: {
        backgroundColor: '#a0cfff',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inverterContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    inverterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    inverterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    removeText: {
        color: '#ff3b30',
        fontSize: 14,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#e1f0ff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    noAccess: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
});
