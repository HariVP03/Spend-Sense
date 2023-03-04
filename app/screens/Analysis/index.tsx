import React, { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { spacing } from "../../theme"

export const AnalysisScreen: FC<any> = function AnalysisScreen(_props) {
  return (
    <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <Text preset="heading" text="Analysis 🕵️" style={$title} />
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.large,
}

const $title: TextStyle = {
  marginBottom: spacing.small,
}
