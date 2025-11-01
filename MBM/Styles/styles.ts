import { StyleSheet } from 'react-native';

const colors = {
  background: 'rgba(255, 249, 239, 1)',
  white: 'rgba(255, 255, 255, 1)',
  buttonBackground: 'rgba(99, 161, 91, 1)',
  buttonBackgroundPress: 'rgba(79, 130, 72, 1)',
  gray: 'rgba(54, 54, 54, 1)',
};

const fonts = {
    Jura : 'Jura-Regular',
    BebasNeue : 'BebasNeue-Regular',
    JuraBold : 'Jura-Bold'
}

export default StyleSheet.create({
  Background: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  form: {
    height: 'auto',
    width: '80%',
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: 'column',
    padding: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6.84,
    elevation: 5,
  },
  textTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: fonts.JuraBold,
  },
  textInput: {
    height: 40,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
    fontSize: 16,
    marginTop: 5,
    marginBottom: -15,
    fontFamily: fonts.JuraBold,
  },
  URLText: {
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 5,
    color: colors.gray,
    fontFamily: fonts.Jura,
  },
  
  buttonStart: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colors.buttonBackground,
    borderRadius: 15,
    paddingHorizontal: 20,
    width: 'auto',
    height: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  buttonStartPressed: {
    backgroundColor: colors.buttonBackgroundPress,
  },
  buttonStartText: {
    color: colors.white,
    fontFamily: fonts.BebasNeue,
    // Separacion de caracteres
    letterSpacing: 3,
    fontSize: 24,
  },
  inputField: {
    height: 40,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 8,
    },
});
