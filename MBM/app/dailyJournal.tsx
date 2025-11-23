import createLogController, { clockIn, clockOut, submitLog } from '@/Controlador/createLogController';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import NavigationBar from '@/components/ui/NavigationBar';
import styles from '@/Styles/styles';

export default function DailyJournal() {
  const [createLogMenu, setCreateLogMenu] =  React.useState(false);
  const [arrivalHour, setArrivalHour] =  React.useState('');
  const [departureHour, setDepartureHour] =  React.useState('');
  const [description, setDescription] =  React.useState('');


  return (
    <View style={styles.Background}>
      <View>
        <TouchableOpacity onPress={() => setCreateLogMenu(v => !v)} style={styles.dropMenuContainer}>
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
                    style={[styles.inputField, { width: '100%', height: 150, textAlignVertical: 'top' }]}
                  />
                </View>
                <View>
                  <Text style={styles.textInput}>Upload File  {/* Falta implementacion */}</Text>
                </View>
                 <TouchableOpacity onPress={async () => {
                    await submitLog({ arrivalHour, departureHour, description, onSuccess: () => {
                      setArrivalHour('');
                      setDepartureHour('');
                      setDescription('');
                      setCreateLogMenu(false);
                    }});
                  }} style={styles.buttonStart}>
                    <Text style={styles.buttonStartText}>Enviar</Text>
                  </TouchableOpacity>
              </View>
          )}
        </View>

        <TouchableOpacity onPress={() => clockIn(setArrivalHour)} style={styles.redButton}>
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