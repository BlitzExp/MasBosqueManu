import { clockIn, clockOut, submitLog } from '@/Controlador/createLogController';
import { sendArrivalAlert } from '@/Controlador/arrivalAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native'; 
import * as ImagePicker from 'expo-image-picker'; 

import NavigationBar from '@/components/ui/NavigationBar';
import styles from '@/Styles/styles';

export default function DailyJournal() {
  const [createLogMenu, setCreateLogMenu] =  React.useState(false);
  const [arrivalHour, setArrivalHour] =  React.useState('');
  const [departureHour, setDepartureHour] =  React.useState('');
  const [description, setDescription] =  React.useState('');
  const [image, setImage] =  React.useState<string | null>(null); 

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.Background}>
      <View>
        <TouchableOpacity onPress={() => setCreateLogMenu(v => !v)} style={styles.dropMenuContainer}>
          <Text style={[styles.HeaderText, { marginTop: 0 }]}>Bitacora</Text>
          <MaterialCommunityIcons
            name={createLogMenu ? "menu-down" : "menu-right"}
            size={40}
            color="black"
            style={styles.dropDownSimbol}
          />
        </TouchableOpacity>
        <View style={[styles.Separator]}></View>
        <View>
          {createLogMenu && (
            <View style={[styles.form, { alignSelf: 'center', width: '90%', justifyContent: 'center' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.textInput}>Hora de Llegada</Text>
                  <TextInput
                    placeholder=""
                    value={arrivalHour}
                    onChangeText={setArrivalHour}
                    style={[styles.inputField, { width: '100%' }]}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.textInput}>Hora de Salida</Text>
                  <TextInput
                    placeholder=""
                    value={departureHour}
                    onChangeText={setDepartureHour}
                    style={[styles.inputField, { width: '100%' }]}
                  />
                </View>
              </View>
              <View>
                <Text style={styles.textInput}>Descripción</Text>
                <TextInput
                  placeholder=""
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.inputField, { width: '100%', height: 100, textAlignVertical: 'top' }]}
                />
              </View>

              {/* --- START: New Image Upload Section --- */}
              <View style={{ marginTop: 10 }}>
                <Text style={styles.textInput}>Adjuntar Foto</Text>

                <TouchableOpacity
                  onPress={pickImage}
                  style={[styles.buttonStart, { backgroundColor: '#E0E0E0', marginTop: 5, marginBottom: 15 }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="camera" size={24} color="#333" />
                    <Text style={[styles.buttonStartText, { color: '#333', marginLeft: 8 }]}>
                      {image ? "Cambiar Imagen" : "Seleccionar Imagen"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {image && (
                  <View style={{ alignItems: 'center', marginBottom: 15 }}>
                    <Image
                      source={{ uri: image }}
                      style={{ width: '25%', height: 50, borderRadius: 10, resizeMode: 'cover' }}
                    />
                  </View>
                )}
              </View>
              {/* --- END: New Image Upload Section --- */}

              <TouchableOpacity onPress={async () => {
                await submitLog({
                  arrivalHour,
                  departureHour,
                  description,
                  image, // Pass the image URI here
                  onSuccess: () => {
                    setArrivalHour('');
                    setDepartureHour('');
                    setDescription('');
                    setImage(null); // Reset the image state
                    setCreateLogMenu(false);
                  }
                });
              }} style={styles.buttonStart}>
                <Text style={styles.buttonStartText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => { clockIn(setArrivalHour); sendArrivalAlert(); }} style={styles.redButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
                      name= "bell"
                      size={20}
                      color="black"
                      style={styles.dropDownSimbolJournal}
                    />
            <Text style={[styles.redButtonText, { right: '5%' }]}>Avisar Llegada</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => clockOut(setDepartureHour)} style={[styles.redButton, { marginTop: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
                      name= "clock"
                      size={20}
                      color="black"
                      style={styles.dropDownSimbolJournal}
                    />
            <Text style={[styles.redButtonText, { right: '5%' }]}>Marcar Salida</Text>
          </View>
        </TouchableOpacity>
      </View>
      <NavigationBar currentTab='create' />
    </View>
  );
}