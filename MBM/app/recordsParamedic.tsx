import { showLogsController } from '@/Controlador/showLogsClient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

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
    if (!fromDate && !toDate ) {
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
      <View style={styles.recordsFilterContainer}>
        <View style={styles.recordsInputRow}>
          <View style={styles.recordsBox}>
            <Text style={styles.fieldName}>Desde</Text>
            <TouchableOpacity
              style={styles.recordsDateInput}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={styles.recordsDateText}>{fromDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>

            <Modal visible={showFromPicker} transparent animationType="fade">
              <View style={styles.recordsModalBackground}>
                <View style={styles.recordsModalContainer}>
                  <View style={styles.recordsModalButtonRow}>
                    <TouchableOpacity
                      style={styles.recordsModalActionButton}
                      onPress={() => {
                        setFromPickerDate(undefined);
                        setFromDate('');
                        setShowFromPicker(false);
                      }}
                    >
                      <Text>Quitar fecha</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.recordsModalActionButton]}
                      onPress={() => setShowFromPicker(false)}
                    >
                      <Text>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={fromPickerDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    textColor="black"
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
          <View style={styles.recordsBox}>
            <Text style={styles.fieldName}>Hasta</Text>
            <TouchableOpacity
              style={styles.recordsDateInput}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={styles.recordsDateText}>{toDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>

            <Modal visible={showToPicker} transparent animationType="fade">
              <View style={styles.recordsModalBackground}>
                <View style={styles.recordsModalContainer}>
                  <View style={styles.recordsModalButtonRow}>
                    <TouchableOpacity
                      style={styles.recordsModalActionButton}
                      onPress={() => {
                        setToPickerDate(undefined);
                        setToDate('');
                        setShowToPicker(false);
                      }}
                    >
                      <Text>Quitar fecha</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.recordsModalActionButton ]}
                      onPress={() => setShowToPicker(false)}
                    >
                      <Text>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={toPickerDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    textColor="black"
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
          <TouchableOpacity
            onPress={applyFilter}
            style={[styles.redButton, styles.recordsFilterButtonInline]}
          >
            <Text style={styles.redButtonText}>Filtrar</Text>
          </TouchableOpacity>

        </View>
      </View>
      <FlatList
        data={logs}
        style={styles.scrollViewStyleRegisters}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
        keyExtractor={(item) =>
          String(item.id ?? item.record_id ?? Math.random())
        }
        renderItem={({ item: log }) => (
          <View style={styles.recordsCard}>
            <Image
              source={
                log.image
                  ? { uri: log.image }
                  : require('../assets/images/MissingImage.jpg')
              }
              style={styles.recordsCardImage}
              resizeMode="cover"
            />
            <View style={styles.recordsCardContent}>
              <Text style={styles.recordsCardDate}>{log.logDate ?? log.date ?? ''}</Text>
              <Text style={styles.recordsCardTitle}>
                {log.description ?? log.summary ?? ''}
              </Text>
              <Text style={styles.recordsCardSubtitle}>
                {(log.ingressTime ?? '') +
                  (log.exitTime ? ` - ${log.exitTime}` : '')}
              </Text>
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
