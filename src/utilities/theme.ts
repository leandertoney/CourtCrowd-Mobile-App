import {Platform, StyleSheet} from 'react-native';

export const colors = {
  primary: '#CAFF00',
  secondry: '#FFD814',
  black: '#000000',
  black2: '#131313',
  blackLight: '#131313',
  orange: '#FFC20E',
  white: '#ffffff',
  red: '#F75555',
  // Simple gray aliases for components
  gray1: '#1A1A1A',
  gray2: '#35383F',
  gray3: '#8F8F8F',
  gray: {
    50: '#626262',
    100: '#646464',
    150: '#343434',
    200: '#35383F',
    250: '#D9D9D9',
    300: '#373737',
    350: '#8F8F8F',
    400: '#5F6772',
  },
  backgroudColor: '#131313',
};

export const fonts = {
  ReadexBold: 'ReadexPro-Bold',
  ReadexSemiBold: 'ReadexPro-SemiBold',
  ReadexMedium: 'ReadexPro-Medium',
  ReadexRegular: 'ReadexPro-Regular',
  ReadexLight: 'ReadexPro-Light',
  GameDay: 'GAMEDAY',
};

export const appStyles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontFamily: fonts.GameDay,
    textShadowColor: '#C82828',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 2,
    color: colors.white,
    marginTop: Platform.OS == 'ios' ? 50 : 10,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: '#7A7A7A',
    lineHeight: 18,
    marginTop: 12,
    width: '73%',
  },
  bottomText: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    textAlign: 'center',
  },

  //   h1: {
  //     fontSize: 20,
  //     fontFamily: fonts.Bold,
  //     color: colors.black,
  //   },
  //   h2: {
  //     fontSize: 18,
  //     fontFamily: fonts.Bold,
  //     color: colors.black,
  //   },
  //   h3: {
  //     fontSize: 16,
  //     fontFamily: fonts.Bold,
  //     color: colors.black,
  //   },
  //   h4: {
  //     fontSize: 14,
  //     fontFamily: fonts.Bold,
  //     color: colors.black,
  //   },
  //   h5: {
  //     fontSize: 12,
  //     fontFamily: fonts.Bold,
  //     color: colors.black,
  //   },
  //   body1: {
  //     fontSize: 20,
  //     fontFamily: fonts.Medium,
  //     color: colors.black,
  //   },
  //   body2: {
  //     fontSize: 18,
  //     fontFamily: fonts.Medium,
  //     color: colors.black,
  //   },
  //   body3: {
  //     fontSize: 16,
  //     fontFamily: fonts.Medium,
  //     color: colors.black,
  //   },
  //   body4: {
  //     fontSize: 14,
  //     fontFamily: fonts.Medium,
  //     color: colors.black,
  //   },
  //   body5: {
  //     fontSize: 12,
  //     fontFamily: fonts.Medium,
  //     color: colors.black,
  //   },
});
