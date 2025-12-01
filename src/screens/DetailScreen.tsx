import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { deletePlant } from '../services/plantService';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
    const { plant } = route.params;
    const { user } = useAuth();
    const canEdit = user?.role === 'admin' || user?.role === 'editor';

    useLayoutEffect(() => {
        if (canEdit) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={() => navigation.navigate('Edit', { plant })}>
                        <Text style={styles.headerButton}>Edit</Text>
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, plant, canEdit]);

    const handleDelete = () => {
        Alert.alert(
            "Delete Plant",
            "Are you sure you want to delete this plant?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (plant.id) {
                            await deletePlant(plant.id);
                            navigation.goBack();
                        }
                    }
                }
            ]
        );
    };

    const DetailItem = ({ label, value }: { label: string, value?: string | number }) => {
        if (!value) return null;
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value} selectable>{value}</Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <DetailItem label="Plant Name" value={plant.name} />
                <DetailItem label="Address" value={plant.address} />
                <DetailItem label="Capacity (kW)" value={plant.capacityKW} />

                <View style={styles.divider} />
                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>Equipment Installed</Text>

                {/* Legacy Support */}
                {(plant.inverterSerial || plant.inverterIp) && (
                    <View style={styles.inverterBlock}>
                        <Text style={styles.inverterTitle}>Primary Inverter (Legacy)</Text>
                        <DetailItem label="Serial Number" value={plant.inverterSerial} />
                        <DetailItem label="IP Address" value={plant.inverterIp} />
                        <DetailItem label="Username" value={plant.inverterUsername} />
                        <DetailItem label="Password" value={plant.inverterPassword} />
                    </View>
                )}

                {/* Equipment Installed List */}
                {plant.inverters?.map((inverter, index) => (
                    <View key={index} style={styles.inverterBlock}>
                        <Text style={styles.inverterTitle}>Inverter {index + 1}</Text>
                        <DetailItem label="Brand" value={inverter.brand} />
                        <DetailItem label="Size" value={inverter.size} />
                        <DetailItem label="Serial Number" value={inverter.serial} />
                        <DetailItem label="WPA-PSK" value={inverter.wpaPsk} />
                        <DetailItem label="IP Address" value={inverter.ip} />
                        <DetailItem label="Username" value={inverter.username} />
                        <DetailItem label="Password" value={inverter.password} />
                    </View>
                ))}

                {!plant.inverterSerial && !plant.inverterIp && (!plant.inverters || plant.inverters.length === 0) && (
                    <Text style={styles.noDataText}>No equipment installed.</Text>
                )}

                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>Network</Text>
                <DetailItem label="WiFi SSID" value={plant.wifiSsid} />
                <DetailItem label="WiFi Password" value={plant.wifiPassword} />

                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>Data Logger</Text>
                <DetailItem label="Username" value={plant.dataLoggerUsername} />
                <DetailItem label="Password" value={plant.dataLoggerPassword} />

                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>Notes</Text>
                <Text style={styles.notes}>{plant.notes || "No notes"}</Text>
            </View>

            {canEdit && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>Delete Plant</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 15,
    },
    notes: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    headerButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 30,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inverterBlock: {
        marginBottom: 15,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    inverterTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    noDataText: {
        fontStyle: 'italic',
        color: '#888',
        marginBottom: 15,
    },
});
