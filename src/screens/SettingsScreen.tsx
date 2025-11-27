import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUsers, addUser, deleteUser } from '../services/userService';
import { changePassword } from '../services/authService';
import { getPlants } from '../services/plantService';
import { updateUserPlantAccess } from '../services/plantAccessService';
import { User, UserRole, SolarPlant } from '../types';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [plants, setPlants] = useState<SolarPlant[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Plant access management
    const [showPlantAccess, setShowPlantAccess] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedPlants, setSelectedPlants] = useState<string[]>([]);

    // Add user form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('viewer');

    // Change password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPasswordChange, setNewPasswordChange] = useState('');

    useEffect(() => {
        loadUsers();
        loadPlants();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadPlants = async () => {
        try {
            const data = await getPlants();
            setPlants(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleManagePlantAccess = (u: User) => {
        setSelectedUser(u);
        setSelectedPlants(u.allowedPlants || []);
        setShowPlantAccess(true);
    };

    const handleTogglePlant = (plantId: string) => {
        setSelectedPlants(prev => {
            if (prev.includes(plantId)) {
                return prev.filter(id => id !== plantId);
            } else {
                return [...prev, plantId];
            }
        });
    };

    const handleSavePlantAccess = async () => {
        if (!selectedUser?.id) return;

        try {
            await updateUserPlantAccess(selectedUser.id, selectedPlants);
            Alert.alert('Success', 'Plant access updated');
            setShowPlantAccess(false);
            loadUsers();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to update access: ' + (error.message || error));
        }
    };

    const handleAddUser = async () => {
        if (!newUsername || !newPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await addUser({
                username: newUsername,
                password: newPassword,
                role: newRole,
            });
            setNewUsername('');
            setNewPassword('');
            setNewRole('viewer');
            setShowAddUser(false);
            loadUsers();
            Alert.alert('Success', 'User added successfully');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to add user: ' + (error.message || error));
        }
    };

    const handleDeleteUser = (userId: string, username: string) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${username}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(userId);
                            loadUsers();
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPasswordChange) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (currentPassword !== user?.password) {
            Alert.alert('Error', 'Current password is incorrect');
            return;
        }

        try {
            if (user?.id) {
                await changePassword(user.id, newPasswordChange);
                Alert.alert('Success', 'Password changed successfully');
                setCurrentPassword('');
                setNewPasswordChange('');
                setShowChangePassword(false);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to change password: ' + (error.message || error));
        }
    };

    if (user?.role !== 'admin') {
        return (
            <View style={styles.container}>
                <Text style={styles.noAccess}>You don't have permission to access settings.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.value}>{user?.username}</Text>
                    <Text style={styles.label}>Role</Text>
                    <Text style={styles.value}>{user?.role}</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setShowChangePassword(!showChangePassword)}
                    >
                        <Text style={styles.buttonText}>Change Password</Text>
                    </TouchableOpacity>

                    {showChangePassword && (
                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                placeholder="Current Password"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                value={newPasswordChange}
                                onChangeText={setNewPasswordChange}
                                secureTextEntry
                            />
                            <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
                                <Text style={styles.submitButtonText}>Update Password</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Users</Text>
                    <TouchableOpacity onPress={() => setShowAddUser(!showAddUser)}>
                        <Text style={styles.addButton}>+ Add User</Text>
                    </TouchableOpacity>
                </View>

                {showAddUser && (
                    <View style={styles.card}>
                        <Text style={styles.formTitle}>Add New User</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={newUsername}
                            onChangeText={setNewUsername}
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                        <Text style={styles.label}>Role</Text>
                        <View style={styles.roleButtons}>
                            {(['admin', 'editor', 'viewer'] as UserRole[]).map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.roleButton, newRole === role && styles.roleButtonActive]}
                                    onPress={() => setNewRole(role)}
                                >
                                    <Text style={[styles.roleButtonText, newRole === role && styles.roleButtonTextActive]}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.submitButton} onPress={handleAddUser}>
                            <Text style={styles.submitButtonText}>Create User</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator style={styles.loader} />
                ) : (
                    users.map((u) => (
                        <View key={u.id} style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={styles.username}>{u.username}</Text>
                                <Text style={styles.role}>{u.role}</Text>
                                {u.allowedPlants && u.allowedPlants.length > 0 && (
                                    <Text style={styles.accessInfo}>
                                        Access to {u.allowedPlants.length} plant(s)
                                    </Text>
                                )}
                                {(!u.allowedPlants || u.allowedPlants.length === 0) && (
                                    <Text style={styles.accessInfo}>Access to all plants</Text>
                                )}
                            </View>
                            <View style={styles.userActions}>
                                <TouchableOpacity onPress={() => handleManagePlantAccess(u)} style={{ marginRight: 15 }}>
                                    <Text style={styles.manageText}>Manage Access</Text>
                                </TouchableOpacity>
                                {u.username !== 'solshare' && (
                                    <TouchableOpacity onPress={() => u.id && handleDeleteUser(u.id, u.username)}>
                                        <Text style={styles.deleteText}>Delete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </View>

            <Modal
                visible={showPlantAccess}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPlantAccess(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Manage Plant Access for {selectedUser?.username}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            Select plants this user can access (empty = all plants)
                        </Text>

                        <ScrollView style={styles.plantList}>
                            {plants.map((plant) => (
                                <TouchableOpacity
                                    key={plant.id}
                                    style={styles.plantItem}
                                    onPress={() => plant.id && handleTogglePlant(plant.id)}
                                >
                                    <View style={styles.checkbox}>
                                        {selectedPlants.includes(plant.id!) && (
                                            <View style={styles.checkboxChecked} />
                                        )}
                                    </View>
                                    <Text style={styles.plantName}>{plant.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowPlantAccess(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSavePlantAccess}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginTop: 10,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    form: {
        marginTop: 15,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 10,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
        marginBottom: 15,
    },
    roleButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    roleButtonText: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    roleButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#34c759',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    role: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    deleteText: {
        color: '#ff3b30',
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#ff3b30',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 20,
    },
    noAccess: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
    accessInfo: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    userActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    manageText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    plantList: {
        maxHeight: 300,
    },
    plantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        width: 14,
        height: 14,
        borderRadius: 2,
        backgroundColor: '#007AFF',
    },
    plantName: {
        fontSize: 16,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
