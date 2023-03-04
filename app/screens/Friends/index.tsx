import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useMemo, useState } from "react"
import {
  AccessibilityProps,
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  Platform,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { Button, Card, EmptyState, Icon, Screen, Text } from "../../components"
import { isRTL, translate } from "../../i18n"
import { colors, spacing } from "../../theme"
import { delay } from "../../utils/delay"
import { load, save } from "../../utils/storage"

const ICON_SIZE = 14

const rnrImage1 = require("../../../assets/images/pic-1.jpg")
const rnrImage2 = require("../../../assets/images/pic-2.jpg")
const rnrImage3 = require("../../../assets/images/pic-3.jpg")

interface Friend {
  id: string
  name: string
  achievement: string
  date: string
  image: any
  liked: boolean
}

const defaultFriends: Friend[] = [
  {
    id: "1",
    name: "John Doe",
    achievement: "Completed their saving goal",
    date: "2 days ago",
    image: rnrImage1,
    liked: false,
  },
  {
    id: "2",
    name: "Jane Doe",
    achievement: "Started a new goal",
    date: "1 week ago",
    image: rnrImage2,
    liked: false,
  },
  {
    id: "3",
    name: "Luffy",
    achievement: "Completed their saving goal",
    date: "2 weeks ago",
    image: rnrImage3,
    liked: false,
  },
]

export const FriendsScreen: FC<any> = observer(function FriendsScreen(_props) {
  const [friends, setFriends] = useState<Friend[]>(defaultFriends)

  useEffect(() => {
    load("friends").then((friends) => {
      if (!friends) {
        setFriends(defaultFriends)
        save("friends", defaultFriends)

        return
      }

      setFriends(friends)
    })
  }, [])

  useEffect(() => {
    save("friends", friends)
  }, [friends])

  const [refreshing, setRefreshing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([delay(750)])
    setRefreshing(false)
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContentContainer}>
      <FlatList<Friend>
        data={friends}
        contentContainerStyle={$flatListContentContainer}
        refreshing={refreshing}
        onRefresh={manualRefresh}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              headingTx={"demoPodcastListScreen.noFavoritesEmptyState.heading"}
              contentTx={"demoPodcastListScreen.noFavoritesEmptyState.content"}
              button={null}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" text="Friends 👯‍♀️" />
          </View>
        }
        renderItem={({ item }) => (
          <FriendCard
            key={item.id}
            friend={item}
            onPressFavorite={() =>
              setFriends((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, liked: !f.liked } : f)),
              )
            }
          />
        )}
      />
    </Screen>
  )
})

const FriendCard = observer(function FriendCard({
  friend,
  onPressFavorite,
}: {
  friend: Friend
  onPressFavorite: () => void
}) {
  const isFavorite = friend.liked
  const liked = useSharedValue(isFavorite ? 1 : 0)

  // Grey heart
  const animatedLikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.EXTEND),
        },
      ],
      opacity: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    }
  })

  // Pink heart
  const animatedUnlikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value,
    }
  })

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityLabel: friend.name,
          accessibilityHint: translate("demoPodcastListScreen.accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: friend.name,
          accessibilityActions: [
            {
              name: "longpress",
              label: translate("demoPodcastListScreen.accessibility.favoriteAction"),
            },
          ],
          onAccessibilityAction: ({ nativeEvent }) => {
            if (nativeEvent.actionName === "longpress") {
              handlePressFavorite()
            }
          },
        },
      }),
    [friend, isFavorite],
  )

  const handlePressFavorite = () => {
    onPressFavorite()
    liked.value = withSpring(liked.value ? 0 : 1)
  }

  const ButtonLeftAccessory = useMemo(
    () =>
      function ButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[$iconContainer, StyleSheet.absoluteFill, animatedLikeButtonStyles]}
            >
              <Icon
                icon="heart"
                size={ICON_SIZE}
                color={colors.palette.neutral800} // dark grey
              />
            </Animated.View>
            <Animated.View style={[$iconContainer, animatedUnlikeButtonStyles]}>
              <Icon
                icon="heart"
                size={ICON_SIZE}
                color={colors.palette.primary400} // pink
              />
            </Animated.View>
          </View>
        )
      },
    [],
  )

  return (
    <Card
      style={$item}
      verticalAlignment="force-footer-bottom"
      HeadingComponent={
        <View style={$metadata}>
          <Text style={$metadataText} size="xxs">
            {friend.name}
          </Text>
          <Text style={$metadataText} size="xxs">
            {friend.date}
          </Text>
        </View>
      }
      content={friend.achievement}
      {...accessibilityHintProps}
      RightComponent={<Image source={friend.image} style={$itemThumbnail} />}
      FooterComponent={
        <Button
          onPress={handlePressFavorite}
          onLongPress={handlePressFavorite}
          style={[$favoriteButton, isFavorite && $unFavoriteButton]}
          accessibilityLabel={isFavorite ? "Unlike" : "Like"}
          LeftAccessory={ButtonLeftAccessory}
        >
          <Text
            size="xxs"
            accessibilityLabel={"episode.duration.accessibilityLabel"}
            weight="medium"
            text={isFavorite ? "Unlike" : "Like"}
          />
        </Button>
      }
    />
  )
})

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: spacing.large,
  paddingTop: spacing.large + spacing.extraLarge,
  paddingBottom: spacing.large,
}

const $heading: ViewStyle = {
  marginBottom: spacing.medium,
}

const $item: ViewStyle = {
  padding: spacing.medium,
  marginTop: spacing.medium,
  minHeight: 120,
}

const $itemThumbnail: ImageStyle = {
  marginTop: spacing.small,
  borderRadius: 50,
  alignSelf: "flex-start",
  height: 50,
  width: 50,
}

const $iconContainer: ViewStyle = {
  height: ICON_SIZE,
  width: ICON_SIZE,
  flexDirection: "row",
  marginEnd: spacing.small,
}

const $metadata: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.extraSmall,
  flexDirection: "row",
}

const $metadataText: TextStyle = {
  color: colors.textDim,
  marginEnd: spacing.medium,
  marginBottom: spacing.extraSmall,
}

const $favoriteButton: ViewStyle = {
  borderRadius: 17,
  marginTop: spacing.medium,
  justifyContent: "flex-start",
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.medium,
  paddingTop: spacing.micro,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
}

const $unFavoriteButton: ViewStyle = {
  borderColor: colors.palette.primary100,
  backgroundColor: colors.palette.primary100,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.huge,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}
// #endregion

// @demo remove-file
