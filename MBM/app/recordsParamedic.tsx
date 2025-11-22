import { showLogsController } from '@/Controlador/showLogs';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import NavigationBar from '@/components/ui/NavigationBar';
import styles from '@/Styles/styles';

export default function RecordsParamedic() {
  const [logs, setLogs] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [fromPickerDate, setFromPickerDate] = useState<Date | undefined>(undefined);
  const [toPickerDate, setToPickerDate] = useState<Date | undefined>(undefined);

  const controller = showLogsController();

  useEffect(() => {
    let mounted = true;
    controller
      .startScreen()
      .then((userLogs) => {
        if (mounted && userLogs) {
          setLogs(userLogs as any[]);
        }
      })
      .catch((err) => console.error('Error loading user logs:', err));

    return () => {
      mounted = false;
    };
  }, []);

  const applyFilter = () => {
    if (!fromDate && !toDate) {
      controller
        .fetchLogs()
        .then((all) => setLogs(all))
        .catch((err) => console.error('Error fetching logs:', err));
      return;
    }
    controller
      .filterLogsBy(fromDate, toDate)
      .then((filtered) => setLogs(filtered))
      .catch((err) => {
        console.error('Error filtering logs:', err);
        Alert.alert('Error', 'No se pudieron filtrar los registros');
      });
  };

  return (
    <View style={styles.Background}>
      <View>
        <Text style={[styles.HeaderText, { marginTop: 100 }]}>Registros</Text>
      </View>

      <View style={[styles.Separator]} />
      <View style={localStyles.filterContainer}>
        <View style={localStyles.inputRow}>
          <View style={localStyles.box}>
            <Text style={styles.fieldName}>Desde</Text>

            <TouchableOpacity
              style={localStyles.dateInput}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={localStyles.dateText}>{fromDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>

            <Modal visible={showFromPicker} transparent animationType="fade">
              <View style={localStyles.modalBackground}>
                <View style={localStyles.modalContainer}>
                  <DateTimePicker
                    value={fromPickerDate ?? new Date()}
                    mode="date"
                    display="inline"
                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                      if (event.type === 'dismissed') {
                        setShowFromPicker(false);
                        return;
                      }
                      if (date) {
                        setFromPickerDate(date);
                        setFromDate(date.toISOString().slice(0, 10));
                      }
                      setShowFromPicker(false);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {/* HASTA */}
          <View style={localStyles.box}>
            <Text style={styles.fieldName}>Hasta</Text>

            <TouchableOpacity
              style={localStyles.dateInput}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={localStyles.dateText}>{toDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>

            <Modal visible={showToPicker} transparent animationType="fade">
              <View style={localStyles.modalBackground}>
                <View style={localStyles.modalContainer}>
                  <DateTimePicker
                    value={toPickerDate ?? new Date()}
                    mode="date"
                    display="inline"
                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                      if (event.type === 'dismissed') {
                        setShowToPicker(false);
                        return;
                      }
                      if (date) {
                        setToPickerDate(date);
                        setToDate(date.toISOString().slice(0, 10));
                      }
                      setShowToPicker(false);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>
        </View>

        {/* BOTÓN FILTRAR */}
        <TouchableOpacity
          onPress={applyFilter}
          style={[localStyles.filterButton, styles.redButton]}
        >
          <Text style={styles.redButtonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- LISTA ---------------- */}
      <FlatList
        data={logs}
        style={styles.scrollViewStyleRegisters}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
        keyExtractor={(item) =>
          String(item.id ?? item.record_id ?? Math.random())
        }
        renderItem={({ item: log }) => (
          <View style={localStyles.card}>
            <Image
              source={require('../assets/images/MissingImage.jpg')}
              style={localStyles.cardImage}
            />
            <View style={localStyles.cardContent}>
              <Text style={localStyles.cardDate}>{log.logDate ?? log.date ?? ''}</Text>
              <Text style={localStyles.cardTitle}>
                {log.description ?? log.summary ?? ''}
              </Text>
              <Text style={localStyles.cardSubtitle}>
                {(log.ingressTime ?? '') +
                  (log.exitTime ? ` - ${log.exitTime}` : '')}
              </Text>

              <TouchableOpacity
                style={[localStyles.moreButton, styles.redButton]}
                onPress={() => console.log('Ver más', log)}
              >
                <Text style={styles.redButtonText}>Ver más</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={styles.registerText}>No hay registros</Text>
          </View>
        )}
      />

      <NavigationBar currentTab="history" />
    </View>
  );
}

const localStyles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  box: {
    flex: 1,
    marginHorizontal: 4,
  },

  dateInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  dateText: {
    fontSize: 14,
  },

  filterButton: {
    width: '100%',
    height: 46,
    borderRadius: 30,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },

  cardImage: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: '#ececec',
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  cardDate: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },

  cardSubtitle: {
    color: '#666',
    marginBottom: 8,
  },

  moreButton: {
    backgroundColor: '#ff7a00',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
