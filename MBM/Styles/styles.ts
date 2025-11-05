import { StyleSheet } from 'react-native';

const colors = {
  background: 'rgba(255, 249, 239, 1)',
  navbackground: 'rgba(231, 222, 210, 1)',
  white: 'rgba(255, 255, 255, 1)',
  buttonBackground: 'rgba(99, 161, 91, 1)',
  buttonBackgroundPress: 'rgba(79, 130, 72, 1)',
  gray: 'rgba(54, 54, 54, 1)',
  greenletters: '#497841',
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
  navBar: {
    position: 'absolute',
    top: 20,
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
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
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
  inputField: {
    height: 40,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 8,
    },
});
