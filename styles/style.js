import { StyleSheet } from 'react-native';

export const colors = {
    primaryColor: "#27d1ef",
    primaryColorDark: "#00333b",
    frostColor: "#90ecf5",
    footerBG: "#fff",
    dangerColor: "#cc2211",
    editColor: "#ff9900",
    defaultColor: "#033a79",
    successColor: "#089608",
    successColorLight: "#2ade2a",
    linkColor: "#0d47a1",
    tagColor: "#1b5e20",
    bgGradDark: "#0a49bb",
    bgGradLight: "#2196F3",
    bgGradAngle: "135deg"
}

export const globalStyles = {
    link: {
        textAlign: "center",
        color: colors.linkColor
    },
    separator: {
        width: "50%",
        borderBottomColor: '#737373',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginTop: 20,
        marginBottom: 20,
    },
    separatorWide: {
        width: "100%",
        borderBottomColor: '#737373',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginTop: 20,
        marginBottom: 20,
    },
}