import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido a HotelFind</Text>
            <Text style={styles.subtitle}>Encuentra tu hotel perfecto para cada viaje!</Text>

            <View style={styles.reservationContainer}>
                <Text style={styles.reservationTitle}>Opciones de Reservación</Text>

                <TouchableOpacity style={styles.buttonPrimary}>
                    <Icon name="hotel" size={22} color="#FFFFFF" style={styles.icon} />
                    <Text style={styles.buttonText}>Reservar Ahora</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSecondary}>
                    <Icon name="local-offer" size={22} color="#FFFFFF" style={styles.icon} />
                    <Text style={styles.buttonText}>Ver Ofertas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonAccent}>
                    <Icon name="restaurant" size={22} color="#FFFFFF" style={styles.icon} />
                    <Text style={styles.buttonText}>Paquetes Especiales</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonDark}>
                    <Icon name="card-membership" size={22} color="#FFFFFF" style={styles.icon} />
                    <Text style={styles.buttonText}>Beneficios de Miembros</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', 
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#004DCC', 
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#333333', 
        marginBottom: 20,
    },
    reservationContainer: {
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    reservationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF8000', 
        marginBottom: 15,
    },
    buttonPrimary: {
        flexDirection: 'row',
        backgroundColor: '#004DCC', 
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        flexDirection: 'row',
        backgroundColor: '#FF8000', 
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonAccent: {
        flexDirection: 'row',
        backgroundColor: '#004DCC', 
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDark: {
        flexDirection: 'row',
        backgroundColor: '#333333', 
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF', 
        fontSize: 16,
        fontWeight: 'bold',
    },
    icon: {
        marginRight: 8,
    },
});

export default HomeScreen;
