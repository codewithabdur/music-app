import React, { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import { IoMdMusicalNote } from "react-icons/io";
import { RiAlbumFill } from "react-icons/ri";
import { MdPlaylistPlay } from "react-icons/md";
import "./MusicApp.css";
import oldclient from "../../lib/oldclient";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from "@material-ui/icons";
import parseFloat from "parsefloat";
import { DNA } from "react-loader-spinner";
import { FaHeart } from "react-icons/fa";
import { CgPlayListAdd } from "react-icons/cg";
import { CgPlayListCheck } from "react-icons/cg";
import { auth, db, storage } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getFirestore,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const MusicApp = () => {
  const [songs, setSongs] = useState([]);
  const [volume, setVolume] = useState(1);
  const [music, setMusic] = useState(1);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [download, setDownload] = useState(false);
  const [liked, setLiked] = useState([]);
  const [alert, setAlert] = useState(false);
  const [userData, setUserData] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [localLiked, setLocalLiked] = useState([]);
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [songSaved, setSongSaved] = useState(null);
  const [songExist, setSongExist] = useState(null);
  const [songRemoved, setSongRemoved] = useState(null);
  const [songNotRemoved, setSongNotRemoved] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(
    Array(songs.length).fill(false)
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [history, setHistory] = useState({
    file: "",
    image: "",
    fileName: "",
    desc: "",
  });
  const [showMore, setShowMore] = useState(
    Array(songs.length).fill(false)
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Fetch the user document from Firestore based on the 'email' field
        const usersCollectionRef = collection(db, "users");
        const q = query(
          usersCollectionRef,
          where("email", "==", currentUser.email)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // If the query result is not empty, there is a matching user
          const data = querySnapshot.docs[0].data();
          setUserData(data);

          // Fetch the user's profile image from Storage
          if (userData.img) {
            const imageRef = ref(storage, userData.img);
            const imageUrl = await getDownloadURL(imageRef);
            // console.log(imageUrl)
            setProfileImage(imageUrl);
          }
        } else {
          console.clear();
        }
      }
    };
    // Call the function immediately
    fetchUserData();
    console.clear()
  }, []);
  const fetchLikedSongs = async () => {
    if (!userData) {
      console.error("User data or UID is missing.");
      console.clear()
      return;
    }

    const likedDocRef = doc(db, "liked", userData.uid);

    try {
      const likedSongsDocSnapshot = await getDoc(likedDocRef);

      if (likedSongsDocSnapshot.exists()) {
        const likedSongs = likedSongsDocSnapshot.data().songs || [];
        setLocalLiked(likedSongs);
      } else {
        console.log("No liked songs found.");
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
    console.clear()
  };

 const fetchPlaylistSongs = async () => {
   if (!userData || !userData.uid) {
     console.error("User data or UID is missing.");
     return;
   }

   const db = getFirestore();
   const playlistDocRef = doc(db, "playlist", userData.uid);

   try {
     const playlistDocSnapshot = await getDoc(playlistDocRef);

     if (playlistDocSnapshot.exists()) {
       const playlistData = playlistDocSnapshot.data().songs
       setLocalPlaylist(playlistData)
     } else {
       console.log("Playlist document does not exist");
     }
   } catch (error) {
     console.error("Error fetching playlist:", error);
   }
 };


  const handleLiked = async (url, image, description, title) => {
    if (!userData || !userData.uid) {
      console.error("User data or UID is missing.");
      return;
    }

    const likedDocRef = doc(db, "liked", userData.uid);

    try {
      console.log("Fetching liked songs document...");
      const likedSongsDocSnapshot = await getDoc(likedDocRef);

      const likedSongData = {
        title: title,
        file: url,
        description: description,
        image: image,
      };

      if (likedSongsDocSnapshot.exists()) {
        const existingLikedSongs = likedSongsDocSnapshot.data().songs || [];

        const songExists = existingLikedSongs.some(
          (song) =>
            song.title === title &&
            song.image === image &&
            song.description === description
        );

        if (!songExists) {
          const updatedLikedSongs = [...existingLikedSongs, likedSongData];
          await setDoc(likedDocRef, { songs: updatedLikedSongs });
          setSongSaved("Song added to liked successfully!");
          setTimeout(() => {
            setSongSaved(null);
          }, 2000);
        } else {
          setSongExist("Song already exists in liked, not adding duplicate.");
          setTimeout(() => {
            setSongExist(null);
          }, 2000);
        }
      } else {
        await setDoc(likedDocRef, { songs: [likedSongData] });
        console.log(
          "No liked songs found. Created new liked songs document and added song."
        );
      }

      // Fetch updated liked songs
      fetchLikedSongs();
      fetchPlaylistSongs();
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };

  const handlePlaylist = async (url, image, title, description) => {
    if (!userData || !userData.uid) {
      console.error("User data or UID is missing.");
      return;
    }

    const playlistDocRef = doc(db, "playlist", userData.uid);

    try {
      const playlistDocSnapshot = await getDoc(playlistDocRef);

      if (playlistDocSnapshot.exists()) {
        const existingPlaylistSongs = playlistDocSnapshot.data().songs || [];
        const playlistSongData = {
          title: title,
          file: url,
          description: description,
          image: image,
        };

        const songExists = existingPlaylistSongs.some(
          (song) =>
            song.title === title &&
            song.image === image &&
            song.description === description
        );

        if (!songExists) {
          const updatedPlaylistSongs = [
            ...existingPlaylistSongs,
            playlistSongData,
          ];
          await setDoc(playlistDocRef, { songs: updatedPlaylistSongs });
          setSongSaved("Successfully saved in playlist");
          setTimeout(() => {
            setSongSaved(null);
          }, 2000);
        } else {
          setSongExist(
            "Song already exists in playlist, not adding duplicate."
          );
          setTimeout(() => {
            setSongExist(null);
          }, 2000);
        }
      } else {
        const playlistSongData = [
          {
            title: title,
            file: url,
            description: description,
            image: image,
          },
        ];

        await setDoc(playlistDocRef, { songs: playlistSongData });
        console.log(
          "No playlist songs found. Created new playlist and added song."
        );
      }

      // Fetch updated playlist songs
      fetchLikedSongs();
      fetchPlaylistSongs();
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };


  const toggleDownloadStatus = (index) => {
    const updatedStatus = [...downloadStatus];
    updatedStatus[index] = !updatedStatus[index];
    setDownloadStatus(updatedStatus);
  };

  const playPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  useEffect(() => {
    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }
  }, [audioPlayer, isPlaying]);

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    if (audioPlayer) {
      audioPlayer.volume = newVolume;
    }
  };

  const handleMusicChange = (event) => {
    const value = parseFloat(event.target.value); // Parse float instead of int
    if (
      !isNaN(value) &&
      isFinite(value) &&
      value >= 0 &&
      value <= 1 &&
      audioPlayer.duration &&
      isFinite(audioPlayer.duration)
    ) {
      setMusic(value);
      audioPlayer.currentTime = value * audioPlayer.duration;
    }
  };

  const playSong = (index, image, fileName, file, desc) => {
    // Pause the previous audio player if it exists
    setHistory({
      file: file,
      image: image,
      fileName: fileName,
      desc: desc,
    });

    if (audioPlayer) {
      audioPlayer.pause();
    }
    window.document.title = `CodeWithAbdur || MelodicVerse - ${fileName} Song Your Personalized Music Experience`;

    // Set up the new audio player
    const newAudioPlayer = new Audio(songs[index]?.file?.asset?.url);
    setAudioPlayer(newAudioPlayer);
    setCurrentSongIndex(index);
    setMusic(0);
    setIsPlaying(false);
    setVolume(audioPlayer ? audioPlayer.volume : volume);
    playPause();
  };
  // console.log(userData.uid);

  const checkHistory = async () => {
    console.clear()
    if (history.file && history.image && history.fileName && history.desc) {
      const historyDocRef = doc(db, "history", userData.uid);

      try {
        const historyDocSnapshot = await getDoc(historyDocRef);
        const historyData = { ...history };

        if (historyDocSnapshot.exists()) {
          const existingHistory = historyDocSnapshot.data().history || [];
          const isDuplicate = existingHistory.some(
            (item) =>
              item.file === historyData.file &&
              item.image === historyData.image &&
              item.fileName === historyData.fileName &&
              item.desc === historyData.desc
          );

          if (!isDuplicate) {
            const updatedHistory = [...existingHistory, historyData];
            await setDoc(historyDocRef, { history: updatedHistory });
            console.log("History stored successfully!");
          } else {
            console.log("History data already exists, not adding duplicate.");
          }
        } else {
          await setDoc(historyDocRef, { history: [historyData] });
          console.log("History stored successfully!");
        }
      } catch (error) {
        console.error("Error storing history:", error);
      }
    } else {
      console.log("Required history fields are missing:", { history });
      console.clear()
    }
  };

  const checkPlayer = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
  };

  const handleNext = (file, image, fileName, desc) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    setAudioPlayer(
      new Audio(filteredSongs()[currentSongIndex + 1]?.file?.asset?.url)
    );
    setCurrentSongIndex(currentSongIndex + 1);
    setMusic(0);
    setIsPlaying(false);
    setVolume(audioPlayer ? audioPlayer.volume : volume);
    playPause();
    setHistory({
      file: file,
      image: image,
      fileName: fileName,
      desc: desc,
    });
  };
  const handlePrev = (file, image, fileName, desc) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    if (currentSongIndex === 0) {
      setAudioPlayer(new Audio(filteredSongs()[0]?.file?.asset?.url));
      setCurrentSongIndex(0);
      setMusic(0);
      setIsPlaying(false);
      setVolume(audioPlayer ? audioPlayer.volume : volume);
      playPause();
      setHistory({
        file: file,
        image: image,
        fileName: fileName,
        desc: desc,
      });
    } else {
      setAudioPlayer(
        new Audio(filteredSongs()[currentSongIndex - 1]?.file?.asset?.url)
      );
      setCurrentSongIndex(currentSongIndex - 1);
      setMusic(0);
      setIsPlaying(false);
      setVolume(audioPlayer ? audioPlayer.volume : volume);
      playPause();
      setHistory({
        file: file,
        image: image,
        fileName: fileName,
        desc: desc,
      });
    }
  };

  useEffect(() => {
    if (audioPlayer) {
      const handleLoadedMetadata = () => {
        audioPlayer.currentTime = music * audioPlayer.duration;
      };

      const handleEnded = () => {
        if (audioPlayer) {
          audioPlayer.pause();
        }
        setAudioPlayer(
          new Audio(filteredSongs()[currentSongIndex + 1]?.file?.asset?.url)
        );
        setCurrentSongIndex(currentSongIndex + 1);
        setMusic(0);
        setIsPlaying(false);
        setVolume(audioPlayer ? audioPlayer.volume : volume);
        playPause();
        setHistory({
          file: filteredSongs()[currentSongIndex + 1]?.file?.asset?.url,
          image: filteredSongs()[currentSongIndex + 1]?.audioimg?.asset?.url,
          fileName: filteredSongs()[currentSongIndex + 1]?.title,
          desc: desc,
        });
      };

      audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioPlayer.addEventListener("ended", handleEnded);

      return () => {
        audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioPlayer.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioPlayer, music]);

  const fetchSongs = () => {
    oldclient
      .fetch(
        `
    *[_type == "podcast"]{
      title,
      subtitle,
      slug,
      description,
      copyright,
      language,
      file{
        asset->{
          url,
        },
      },
      audioimg{
        asset->{
          url,
        },
      },
      category
    }
    `
      )
      .then((data) => {
        setSongs(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
      fetchSongs()
      checkHistory()
      fetchPlaylistSongs()
      fetchLikedSongs()
  }, []);

  const handleDownload = async (musicUrl, fileName, index) => {
    toggleDownloadStatus(index); // Toggle download status
    try {
      const response = await fetch(musicUrl);

      if (response.ok) {
        const blob = await response.blob();

        // Create a Blob URL
        const blobUrl = window.URL.createObjectURL(blob);

        // Create an anchor element
        const a = document.createElement("a");
        a.href = blobUrl;

        // Set the download attribute and file name
        a.download = fileName;

        // Trigger a click on the link
        a.click();
        setDownloadStatus(false);

        // Revoke the Blob URL
        window.URL.revokeObjectURL(blobUrl);
      } else {
        console.error("Failed to download the video");
        setDownloadStatus(false);
      }
    } catch (error) {
      console.error("Error during video download:", error);
      setDownloadStatus(false);
    } finally {
      toggleDownloadStatus(index); // Toggle download status back
      setDownloadStatus(false);
    }
  };

  const filteredSongs = () => {
    switch (selectedCategory) {
      case "All":
        return songs;
      default:
        return songs.filter((song) => song.category.includes(selectedCategory));
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioPlayer.currentTime);
  };

  useEffect(() => {
    // Add an event listener for time updates when the audio player is set
    if (audioPlayer) {
      audioPlayer.addEventListener("timeupdate", handleTimeUpdate);

      // Cleanup function to remove the event listener when component unmounts or audio player changes
      return () => {
        audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [audioPlayer]);

  const handeleRemoveSong = async (index) => {
    const db = getFirestore();
    const playlistDocRef = doc(db, "playlist", userData.uid);

    try {
      const playlistDocSnapshot = await getDoc(playlistDocRef);

      if (playlistDocSnapshot.exists()) {
        const existingPlaylist = playlistDocSnapshot.data().songs || [];

        if (index >= 0 && index < existingPlaylist.length) {
          const updatedPlaylist = [
            ...existingPlaylist.slice(0, index),
            ...existingPlaylist.slice(index + 1),
          ];

          await setDoc(playlistDocRef, { songs: updatedPlaylist });
          console.log("Song removed from playlist successfully!")
          setSongRemoved("Song removed from playlist successfully!")
          setTimeout(() => {
            setSongRemoved(null)
          },2000)
          return updatedPlaylist; // return the updated playlist
        } else {
          console.log("Index out of bounds", error);
          setSongNotRemoved("Index out of bounds");
           setTimeout(() => {
             setSongNotRemoved(null);
           }, 2000);
        }
      } else {
        console.log("Playlist document does not exist", error);
        setSongNotRemoved("Playlist document does not exist");
        setTimeout(() => {
          setSongNotRemoved(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      setSongNotRemoved("Sorry might be internet Issues or userData is Not Found!")
      setTimeout(() => {
        setSongNotRemoved(null);
      }, 2000);
    }
  };
  const handeleRemoveLikedSong = async (index) => {
    const db = getFirestore();
    const likedDocRef = doc(db, "liked", userData.uid);

    try {
      const likedDocSnapshot = await getDoc(likedDocRef);

      if (likedDocSnapshot.exists()) {
        const existingLiked = likedDocSnapshot.data().songs || [];

        if (index >= 0 && index < existingLiked.length) {
          const updatedLiked = [
            ...existingLiked.slice(0, index),
            ...existingLiked.slice(index + 1),
          ];

          await setDoc(likedDocRef, { songs: updatedLiked });
          console.log("Song removed from liked successfully!");
          setSongRemoved("Song removed from liked successfully!");
          setTimeout(() => {
            setSongRemoved(null);
          }, 2000);
          return updatedLiked; // return the updated playlist
        } else {
          console.log("Index out of bounds", error);
          setSongNotRemoved("Index out of bounds");
          setTimeout(() => {
            setSongNotRemoved(null);
          }, 2000);
        }
      } else {
        console.log("Liked document does not exist", error);
        setSongNotRemoved("Liked document does not exist");
        setTimeout(() => {
          setSongNotRemoved(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error removing song from liked:", error);
      setSongNotRemoved("Sorry might be internet Issues or userData is Not Found!")
      setTimeout(() => {
        setSongNotRemoved(null);
      }, 2000);
    }
  };

     const toggleShowMore = (index) => {
       setShowMore((prevShowMore) => {
         const updatedShowMore = [...prevShowMore];
         updatedShowMore[songIndex] = !updatedShowMore[songIndex];
         return updatedShowMore;
       });
     };

  return (
    <>
      <div>
        {/* ------------------------Alert-------------------------- */}

        {songSaved == null ? (
          ""
        ) : (
          <div className="absolute top-1 right-1 z-10">
            <div
              aria-live="assertive"
              className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
              <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          Successfully saved!
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {songSaved ? songSaved : ""}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0">
                        <button
                          onClick={setSongSaved(null)}
                          type="button"
                          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {songExist == null ? (
          ""
        ) : (
          <div className="absolute top-1 right-1 z-10">
            <div
              aria-live="assertive"
              className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
              <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-[#ff0808]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          Ooops!
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {songExist ? songExist : ""}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0">
                        <button
                          onClick={setSongExist(null)}
                          type="button"
                          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {songNotRemoved == null ? (
          ""
        ) : (
          <div className="absolute top-1 right-1 z-10">
            <div
              aria-live="assertive"
              className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
              <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-[#ff0808]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          Ooops!
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {songNotRemoved ? songNotRemoved : ""}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0">
                        <button
                          onClick={setSongNotRemoved(null)}
                          type="button"
                          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {songSaved == null ? (
          ""
        ) : (
          <div className="absolute top-1 right-1 z-10">
            <div
              aria-live="assertive"
              className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
              <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          Successfully saved!
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {songRemoved ? songRemoved : ""}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0">
                        <button
                          onClick={setSongRemoved(null)}
                          type="button"
                          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ------------------------Alert-------------------------- */}
        <div className="flex h-[70vh]">
          <div className="sideBar md:w-[20vw] w-[30vw] ">
            <div className="flex flex-col md:justify-center justify-start md:items-center items-end text-[#fff] text-[20px] font-bold">
              <div className="mb-4 md:mt-8 p-2">
                <span className=" text-[#a7a6a6]">Browse</span>
                <ul className="flex flex-col">
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("All")}
                  >
                    All
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("New Release")}
                  >
                    New Release
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("Top Playlist")}
                  >
                    Top Playlist
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("Old Playlist")}
                  >
                    Old PlayList
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("Dance Song")}
                  >
                    Dance Song
                  </li>
                </ul>
              </div>
              <div className="md:my-4 p-2">
                <span className=" text-[#a7a6a6]">Library</span>
                <ul className="flex flex-col">
                  <div
                    className="flex items-center mt-4"
                    onClick={() => {
                      navigate(`/history`);
                      checkPlayer();
                    }}
                  >
                    <span className="mr-1">
                      <FaHistory />
                    </span>
                    <li className="my-1 cursor-pointer">History</li>
                  </div>
                  <div
                    className="flex items-center md:mb-0 mb-6"
                    onClick={() => {
                      navigate(`/playlistpage`);
                      checkPlayer();
                    }}
                  >
                    <span className="mr-1">
                      <MdPlaylistPlay />
                    </span>
                    <li className="my-1 cursor-pointer">PlayList</li>
                  </div>
                </ul>
              </div>
            </div>
          </div>
          {filteredSongs().length === 0 && (
            <div className="h-screen w-full flex justify-center items-center">
              <DNA
                visible={true}
                height="150"
                width="150"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperclassName="dna-wrapper"
              />
            </div>
          )}
          {filteredSongs().length > 0 && (
            <div className="heroSection w-[70vw] md:w-[80vw] h-[70vh] overflow-scroll">
              <div className="md:w-[75vw] w-[65vw] mx-auto h-full">
                <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto ">
                  {filteredSongs().map((song, index) => {
                    const isSongInPlaylist = localPlaylist.some(
                      (playlist) => playlist.description === song.title
                    );
                    const isSongInLiked = localLiked.some(
                      (liked) => liked.title === song.title
                    );
                    return (
                      <div
                        key={song.slug.current}
                        onClick={() =>
                          playSong(
                            index,
                            song.audioimg.asset.url,
                            song.title,
                            song?.file?.asset?.url,
                            song?.description
                          )
                        }
                        className=" rounded-lg cursor-pointer select-none shadow-lg bg-white boxShadow border-black border hover:bg-[#5a0a72] transition-all duration-300"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={song.audioimg.asset.url}
                            alt={song.title ? song.title : "image"}
                            className="rounded-t-lg object-cover text-white"
                          />
                        </div>
                        <div className="flex justify-between">
                          <p className="pl-2 pb-2 text-lg text-[#b3b3b3] mt-2">
                            {song.title}
                          </p>
                          {/* {showMore[index] ? (
                            <p className="pl-2 py-2 text-lg text-[#b3b3b3] mt-2">
                              {song.description}....
                              <a
                                onClick={() => toggleShowMore(songIndex)}
                                className="text-[#6c11b6]"
                              >
                                Show Less
                              </a>
                            </p>
                          ) : (
                            <p className="pl-2 py-2 text-lg text-[#b3b3b3] mt-2">
                              {song.description.substring(0, 100)}....
                              <a
                                className="text-[#6c11b6]"
                                onClick={() => toggleShowMore(songIndex)}
                              >
                                Show More
                              </a>
                            </p>
                          )} */}
                          <button
                            className="downloadButton mr-1 my-2"
                            onClick={() =>
                              handleDownload(
                                song?.file?.asset?.url,
                                song.title,
                                index
                              )
                            }
                          >
                            {downloadStatus[index]
                              ? "Downloading.."
                              : "Download"}
                          </button>
                        </div>
                        <div className="flex justify-between z-10">
                          {isSongInLiked ? (
                            <FaHeart
                              onClick={() => {
                                handeleRemoveLikedSong(index);
                                fetchLikedSongs();
                                fetchPlaylistSongs();
                              }}
                              className="text-[2rem] m-2 text-[#ff2d2d] "
                            />
                          ) : (
                            <FaHeart
                              onClick={() => {
                                handleLiked(
                                  song?.file?.asset?.url,
                                  song?.audioimg?.asset?.url,
                                  song?.description,
                                  song?.title
                                );
                                fetchLikedSongs();
                                fetchPlaylistSongs();
                              }}
                              className="text-[2rem] m-2 text-[#efe9e9] z-40"
                            />
                          )}
                          {isSongInPlaylist ? (
                            <CgPlayListCheck
                              onClick={() => {
                                handeleRemoveSong(index);
                                fetchLikedSongs();
                                fetchPlaylistSongs();
                              }}
                              className="text-[2rem] m-2 text-[#646464] cursor-pointer z-40"
                            />
                          ) : (
                            <CgPlayListAdd
                              className="text-[2rem] m-2 text-[#646464] z-40"
                              onClick={() => {
                                handlePlaylist(
                                  song?.file?.asset?.url,
                                  song.audioimg.asset.url,
                                  song.description,
                                  song.title
                                );
                                fetchLikedSongs();
                                fetchPlaylistSongs();
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="md:h-[16.6vh] fixed bottom-0 right-0 left-0">
          <div className="flex items-center justify-around h-[16.6vh] my-auto ">
            <img
              src={filteredSongs()[currentSongIndex]?.audioimg?.asset?.url}
              alt={
                filteredSongs()[currentSongIndex]
                  ? filteredSongs()[currentSongIndex]?.title
                  : "song image"
              }
              className="h-[2rem] object-cover text-white"
            />
            <SkipPrevious
              style={{ fontSize: 40, color: "#fff" }}
              onClick={() =>
                handlePrev(
                  filteredSongs()[currentSongIndex]?.audioimg?.asset?.url,
                  filteredSongs()[currentSongIndex]?.file?.asset?.url,
                  filteredSongs()[currentSongIndex]?.title
                )
              }
              className="cursor-pointer"
            />
            <span onClick={playPause} className="cursor-pointer">
              {isPlaying ? (
                <Pause style={{ fontSize: 40, color: "#fff" }} />
              ) : (
                <PlayArrow style={{ fontSize: 40, color: "#fff" }} />
              )}
            </span>

            <SkipNext
              style={{ fontSize: 40, color: "#fff" }}
              onClick={() =>
                handleNext(
                  filteredSongs()[currentSongIndex]?.audioimg?.asset?.url,
                  filteredSongs()[currentSongIndex]?.file?.asset?.url,
                  filteredSongs()[currentSongIndex]?.title
                )
              }
              className="cursor-pointer"
            />
            <div>
              <VolumeUp style={{ fontSize: 40, color: "#fff" }} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{ width: "100px" }}
              />
            </div>
            <div
              style={{
                width: "50%",
                height: "1vh",
                position: "relative",
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={
                  audioPlayer ? currentTime / audioPlayer.duration || 0 : 0
                } // Ensure division by zero is handled
                onChange={handleMusicChange}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicApp;
