import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserProfile } from '@/hooks/useUserProfile';
import { userService } from '@/services/userService';
import { UserProfileForm } from '@/components/UserProfileForm';

export default function ProfileScreen() {
  const { profile, loading, saveProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveProfile = async (data: any) => {
    try {
      setIsSubmitting(true);
      await saveProfile(data);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
        <UserProfileForm
          profile={profile || undefined}
          onSubmit={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="person-add" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No tienes perfil creado</Text>
          <Text style={styles.emptySubtext}>
            Completa tu información personal para comenzar
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsEditing(true)}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Crear Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const bmi = userService.calculateBMI(profile.weight, profile.height);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <MaterialIcons name="account-circle" size={80} color="#3B82F6" />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Edad</Text>
          <Text style={styles.statValue}>{profile.age}</Text>
          <Text style={styles.statUnit}>años</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Peso</Text>
          <Text style={styles.statValue}>{profile.weight}</Text>
          <Text style={styles.statUnit}>kg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Estatura</Text>
          <Text style={styles.statValue}>{profile.height}</Text>
          <Text style={styles.statUnit}>cm</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>IMC</Text>
          <Text style={[styles.statValue, { color: getBMIColor(bmi) }]}>{bmi}</Text>
          <Text style={styles.statUnit}>{getBMICategory(bmi)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="wc" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Género</Text>
            <Text style={styles.infoValue}>
              {profile.gender === 'M'
                ? 'Masculino'
                : profile.gender === 'F'
                ? 'Femenino'
                : 'Otro'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="cake" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
            <Text style={styles.infoValue}>
              {new Date(profile.birthDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="email" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return '#3B82F6'; // Bajo peso
  if (bmi < 25) return '#10B981'; // Normal
  if (bmi < 30) return '#F59E0B'; // Sobrepeso
 // return '#EF4444'; // Obesidad
 return '#10B981'; // Normal
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  //return 'Obesidad';
  return 'Normal';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  buttonGroup: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});
