import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Episode, EpisodeModel } from "./Episode"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const EpisodeStoreModel = types
  .model("EpisodeStore")
  .props({
    episodes: types.array(EpisodeModel),
    favorites: types.array(types.reference(EpisodeModel)),
    favoritesOnly: false,
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    fetchEpisodes() {
      return [
        {
          id: 1,
          name: "Aman",
          achievement: "Walked 10k steps",
        },
        {
          id: 2,
          name: "Shanks",
          achievement: "Walked 13k steps",
        },
        {
          id: 3,
          name: "Luffy",
          achievement: "Walked 23k steps",
        },
      ]
    },
    addFavorite(episode: Episode) {
      store.favorites.push(episode)
    },
    removeFavorite(episode: Episode) {
      store.favorites.remove(episode)
    },
  }))
  .views((store) => ({
    get episodesForList() {
      return store.favoritesOnly ? store.favorites : store.episodes
    },

    hasFavorite(episode: Episode) {
      return store.favorites.includes(episode)
    },
  }))
  .actions((store) => ({
    toggleFavorite(episode: Episode) {
      if (store.hasFavorite(episode)) {
        store.removeFavorite(episode)
      } else {
        store.addFavorite(episode)
      }
    },
  }))

export interface EpisodeStore extends Instance<typeof EpisodeStoreModel> {}
export interface EpisodeStoreSnapshot extends SnapshotOut<typeof EpisodeStoreModel> {}

// @demo remove-file
