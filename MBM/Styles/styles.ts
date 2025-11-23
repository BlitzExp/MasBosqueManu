import { Dimensions, StyleSheet } from 'react-native';

const windowHeight = Dimensions.get('window').height;
const dropdownMaxHeight = Math.round(windowHeight * 0.3);
const dropdownMaxHeightRegisters = Math.round(windowHeight * 0.8);


const colors = {
  background: '#fdf7edff',
  navbackground: 'rgba(231, 222, 210, 1)',
  white: 'rgba(255, 255, 255, 1)',
  buttonBackground: 'rgba(99, 161, 91, 1)',
  buttonBackgroundPress: 'rgba(79, 130, 72, 1)',
  gray: 'rgba(54, 54, 54, 1)',
  black: 'rgba(0, 0, 0, 1)',
  greenletters: '#497841',
  inputBackground: '#E6E0E9',
  redButton: '#EC6200',
};


const fonts = {
    Jura : 'Jura-Regular',
    BebasNeue : 'BebasNeue-Regular',
    JuraBold : 'Jura-Bold'
}

export default StyleSheet.create({

  // Loading Screen Styles
  loadingtext: {
    paddingTop: 20,
    fontSize: 36,
    fontFamily: fonts.JuraBold,
    color: colors.greenletters,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    alignContent: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },

  // Navigation Bar Styles
  navBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    alignContent: 'center',
    alignSelf: 'center',
    height: 50,
    backgroundColor: colors.navbackground,
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 30,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  activeNavItemMap: {
    backgroundColor: colors.buttonBackground,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  activeNavItem: {
    backgroundColor: colors.buttonBackground,
  },
  activeNavItemProfile: {
    backgroundColor: colors.buttonBackground,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  navIcon: {
    fontSize: 24,
    color: colors.gray,
  },
  activeNavIcon: {
    color: colors.white,
  },
  navtext:
  {
    color: colors.gray,
  },
  activeText: {
    color: colors.white,
  },

  // General Styles 
  Background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  BackgroundForms: {
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
    marginBottom: 10,
    backgroundColor: colors.buttonBackground,
    borderRadius: 15,
    width: 'auto',
    height: 40,
    minWidth: '80%',
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
    letterSpacing: 3,
    fontSize: 24,
  },


  //estilos para editar perfil
  inputField: {
    height: 40,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 8,
    },
    userInputContainer: {
      width: '85%',
      alignSelf: 'center',
      borderRadius: 20,
      marginTop: 20,
      backgroundColor: colors.inputBackground,
    },
    HeaderText:
    {
      marginTop: 100,
      fontFamily: fonts.BebasNeue,
      fontSize: 36,
      lineHeight: 38,
      letterSpacing: 2,
      paddingLeft: '10%',
      textAlign: 'left',
    },
    Separator: 
    {
      borderWidth: 2,
      borderColor: colors.gray,
      marginHorizontal: '5%',
    },
    fieldName:
    {
      paddingLeft: '5%',
      color : colors.gray,
      fontSize: 12,
      letterSpacing: 0.4,
      lineHeight: 16,
      marginTop: 10,
    },
    fieldInput: 
    {
      color: colors.black,
      fontSize: 16,
      paddingTop: 5,
      letterSpacing: 0.5,
      paddingLeft: '7%',
      marginBottom: 10,
    },
    passwordContainer:
    {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingRight: '0%',
    },
    Icons:
    {
      alignContent: 'flex-end',
    },
    passwordInner: {
      width: '100%',
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: colors.gray,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 8,
      marginBottom: 20,
      backgroundColor: colors.white,
    },
    passwordTextInput: {
      flex: 1,
      paddingVertical: 0,
      paddingHorizontal: 4,
      fontSize: 16,
    },
    passwordIconButton: {
      paddingLeft: 8,
      paddingRight: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },

    redButton:
    {
      backgroundColor: colors.redButton,
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      justifyContent: 'center',
      width : '70%',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 30,
    },
    redButtonText: {
      color: colors.white,
      letterSpacing: 0.1,
      fontSize: 16,
    },
    dropMenuContainer: {
      marginTop: 100,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '85%',
      alignContent: 'center',
      alignItems: 'center',
      
    },
    dropDownSimbol: {
      alignContent: 'flex-end',
      alignSelf: 'center',
      marginRight: '-10%',
    },

    alertItem: {
      flexDirection: 'row',
      borderRadius: 30,
      backgroundColor: '#ffffffff',
      width : '90%',
      alignSelf: 'center',
      padding: 15,
      marginTop: 10,
      borderColor: colors.gray,
      borderWidth: 1,
    },
    alertText: {
      fontSize: 16,
      marginTop: 0,
    },
    alertTextSecondary: {
      paddingLeft: '5%',
      fontSize: 14,
      marginTop: 0,
    },
     redButtonAlert:
    {
      backgroundColor: colors.redButton,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      paddingHorizontal: 12,
      height: 40,
      marginLeft: 'auto',
    },
    scrollViewStyle: {
      maxHeight: dropdownMaxHeight,
      paddingBottom: 10,
    },
    scrollViewStyleRegisters: {
      maxHeight: dropdownMaxHeightRegisters,
      paddingBottom: 10,
    },
    alertTextContainer: {
      flex: 1,
      paddingLeft: 10,
    },

    dropDownSimbolJournal: {
      alignContent: 'flex-end',
      alignSelf: 'flex-start',
      marginRight: '10%',
      color: colors.white,
    },

    dropdownButton: {
      backgroundColor: colors.white,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gray,
    },
    dropdownMenu: {
      backgroundColor: colors.white,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.gray,
      marginTop: 6,
      overflow: 'hidden',
      width: '100%',
    },
    dropdownOption: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.06)'
    },
    imageContainer: {
      alignItems: 'center',
      height: 150,
      width: 150,
      borderRadius: 75,
      overflow: 'hidden',
      marginBottom: 20,
    },
    registerTitle:{
      fontSize: 30,
      marginBottom: 20,
      fontFamily: fonts.JuraBold,
    },
    registerText:{
      fontSize: 16,
      marginBottom: 10,
      fontFamily: fonts.Jura,
      marginRight: '45%',
    },

    recordsFilterContainer: {
      paddingHorizontal: 16,
      marginTop: 10,
      marginBottom: 10,
    },
    recordsCardUserName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },

    recordsInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    recordsBox: {
      width: '35%',
      minWidth: 120,
      marginHorizontal: 4,
      
    },

    recordsDateInput: {
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
    },

    recordsDateText: {
      fontSize: 14,
      color: colors.black,
    },

    recordsFilterButtonInline: {
      flex: 1,
      height: 40,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      marginLeft: 8,
      width: undefined,
      alignSelf: 'stretch',
    },

    recordsModalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    recordsModalContainer: {
      backgroundColor: colors.white,
      padding: 20,
      borderRadius: 12,
      minWidth: 320,
      minHeight: 320,
      justifyContent: 'center',
      alignItems: 'stretch',
    },

    recordsModalButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },

    recordsModalActionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
      backgroundColor: '#f0f0f0',
    },

    recordsCard: {
      flexDirection: 'row',
      backgroundColor: colors.white,
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

    recordsCardImage: {
      width: 86,
      height: 86,
      borderRadius: 10,
      backgroundColor: '#ececec',
      marginRight: 12,
    },

    recordsCardContent: {
      flex: 1,
    },

    recordsCardDate: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },

    recordsCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
    },

    recordsCardSubtitle: {
      color: '#666',
      marginBottom: 8,
    },

    recordsMoreButton: {
      backgroundColor: '#ff7a00',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },

});
