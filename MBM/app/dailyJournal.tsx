import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from "@/services/supabase";
import { Alert } from "react-native";
import { createUserLog } from "@/services/logService";
import { createArrivalAlert } from "@/services/arrivalAlertService";
import { getUser as getLocalUser } from '@/services/localdatabase';


import React from 'react';

import NavigationBar from '@/components/ui/NavigationBar';
import styles from '@/Styles/styles';

export default function DailyJournal() {
  const router = useRouter();
   const userType = 'medic'; 

  const [createLogMenu, setCreateLogMenu] =  React.useState(false);
  const [arrivalHour, setArrivalHour] =  React.useState('');
  const [departureHour, setDepartureHour] =  React.useState('');
  const [description, setDescription] =  React.useState('');
  const [name, setName] = React.useState('');

  const handleArrivalHourChange = (text: string) => {
    setArrivalHour(text);
  };
  const handleDepartureHourChange = (text: string) => {
    setDepartureHour(text);
  };
  const handleDescriptionChange = (text: string) => {
    setDescription(text);
  };

  const handleClockIn = async () => {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  setArrivalHour(formattedTime);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    Alert.alert("Error", "Debes iniciar sesión.");
    return;
  }

  // fallback to local DB name if the input field is empty
  let nameToUse = name && name.trim() ? name.trim() : null;
  if (!nameToUse) {
    try {
      const local = await getLocalUser();
      if (local && local.name) nameToUse = local.name;
    } catch (err) {
      // ignore, we'll use default
    }
  }

  await createArrivalAlert({
    userID: user.id,
    name: nameToUse || "Sin nombre",
    arrivalTime: formattedTime,
    exitTime: null
  });

  Alert.alert("Alerta enviada", "Tu llegada ha sido notificada al administrador.");
};


  const handleClockOut = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    setDepartureHour(formattedTime);
  }

  const handleSubmit = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    // allow using name from local DB if input empty
    let nameToUse = name && name.trim() ? name.trim() : null;
    if (!nameToUse) {
      try {
        const local = await getLocalUser();
        if (local && local.name) nameToUse = local.name;
      } catch (err) {
        // ignore
      }
    }

    if (!nameToUse) {
      Alert.alert("Error", "Debes ingresar tu nombre.");
      return;
    }

    const log = {
      userID: user.id,
      name: nameToUse,           
      logDate: new Date().toISOString().split("T")[0],
      ingressTime: arrivalHour,
      exitTime: departureHour,
      description,
      image: null,
    };

    await createUserLog(log);

    Alert.alert("Éxito", "Bitácora enviada.");
    setArrivalHour("");
    setDepartureHour("");
    setDescription("");
    setCreateLogMenu(false);

  } catch (err: any) {
    console.log(err);
    Alert.alert("Error", err.message);
  }
};


  const toggleLogMenu = () => {
    setCreateLogMenu(!createLogMenu);
  }


  return (
    <View style={styles.Background}>
      <View>
        <TouchableOpacity onPress={toggleLogMenu} style={styles.dropMenuContainer}>
          <Text style={[styles.HeaderText, { marginTop: 0 }]}>Bitacora</Text>
          <MaterialCommunityIcons
            name= {createLogMenu ? "menu-down" : "menu-right"}
            size={40}
            color="black"
            style={styles.dropDownSimbol}
          />
        </TouchableOpacity>
        <View style= {[styles.Separator]}></View>
        <View>
          { createLogMenu && (
              <View style={[styles.form, { alignSelf: 'center', width: '90%', justifyContent: 'center' }]}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.textInput}>Hora de Llegada</Text>
                    <TextInput
                      placeholder=""
                      value={arrivalHour}
                      onChangeText={handleArrivalHourChange}
                      style={[styles.inputField, { width: '100%' }]}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.textInput}>Hora de Salida</Text>
                    <TextInput
                      placeholder=""
                      value={departureHour}
                      onChangeText={handleDepartureHourChange}
                      style={[styles.inputField, { width: '100%' }]}
                    />
                  </View>
                </View>
                <View>
                <Text style={styles.textInput}>Nombre</Text>
                <TextInput
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChangeText={setName}
                  style={[styles.inputField, { width: '100%' }]}
                />
                </View>

                <View>
                  <Text style={styles.textInput}>Descripción</Text>
                  <TextInput
                    placeholder=""
                    value={description}
                    onChangeText={handleDescriptionChange}
                    style={[styles.inputField, { width: '100%', height: 150, textAlignVertical: 'top' }]}
                    multiline
                  />
                </View>
                <View>
                  <Text style={styles.textInput}>Upload File  {/* Falta implementacion */}</Text>
                </View>
                 <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
                    <Text style={styles.buttonStartText}>Enviar</Text>
                  </TouchableOpacity>
              </View>
          )}
        </View>

        <TouchableOpacity onPress={handleClockIn} style={styles.redButton}>
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
        <TouchableOpacity onPress={handleClockOut} style={[styles.redButton, { marginTop: 10 }]}>
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