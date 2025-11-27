import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getPlants } from '../services/plantService';
import { SolarPlant } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const { user, logout } = useAuth();
    const [plants, setPlants] = useState<SolarPlant[]>([]);
    const [filteredPlants, setFilteredPlants] = useState<SolarPlant[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {user?.role === 'admin' && (
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 15 }}>
                            <Text style={styles.headerButton}>Settings</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={logout}>
                        <Text style={styles.headerButton}>Logout</Text>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, user, logout]);

    const loadPlants = async () => {
        setLoading(true);
        try {
            const data = await getPlants();
            // Filter plants based on user's allowed plants
            let filteredData = data;
            if (user?.allowedPlants && user.allowedPlants.length > 0) {
                filteredData = data.filter(plant => plant.id && user.allowedPlants!.includes(plant.id));
            }
            setPlants(filteredData);
            setFilteredPlants(filteredData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPlants();
        }, [user]) // Added user to dependency array to re-run when user changes
    );

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text) {
            const filtered = plants.filter((plant) =>
                plant.name.toLowerCase().includes(text.toLowerCase()) ||
                plant.address?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredPlants(filtered);
        } else {
            setFilteredPlants(plants);
        }
    };

    const renderItem = ({ item }: { item: SolarPlant }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Detail', { plant: item })}
        >
            <Text style={styles.title}>{item.name}</Text>
            {item.address && <Text style={styles.subtitle}>{item.address}</Text>}
            {item.capacityKW && <Text style={styles.detail}>Capacity: {item.capacityKW} kW</Text>}
        </TouchableOpacity>
    );

    const canEdit = user?.role === 'admin' || user?.role === 'editor';

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search plants..."
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={filteredPlants}
                renderItem={renderItem}
                keyExtractor={(item) => item.id || Math.random().toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadPlants} />
                }
                ListEmptyComponent={
                    !loading ? <Text style={styles.emptyText}>No plants found. {canEdit ? 'Add one!' : ''}</Text> : null
                }
            />

            {canEdit && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Edit', {})}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    list: {
        padding: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    detail: {
        fontSize: 14,
        color: '#444',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: -2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
    headerButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 15,
    },
});
