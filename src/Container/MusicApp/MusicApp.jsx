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
  updateDoc,
  doc,
  addDoc,
  getFirestore,
  setDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

const MusicApp = () => {
  const [songs, setSongs] = useState([]);
  const [volume, setVolume] = useState(1);
  const [music, setMusic] = useState(1);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [download, setDownload] = useState(false);
  const [liked, setLiked] = useState(false);
  const [userData, setUserData] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [localLiked, setLocalLiked] = useState([]);
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState(
    Array(songs.length).fill(false)
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [history, setHistory] = useState({
    file: "",
    image: "",
    fileName: "",
  });

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
          // console.clear();
        }
      }
    };
    // Call the function immediately
    fetchUserData();
    const fetchLikedSongs = async () => {
      try {
        const db = getFirestore();
        if (userData && userData.uid) {
          const likedSongsDocRef = doc(db, "likedSongs", userData.uid);
          const likedSongsDocSnapshot = await getDoc(likedSongsDocRef);
          if (likedSongsDocSnapshot) {
            const likedSongsData = likedSongsDocSnapshot.data().songs || [];
            setLikedSongs(likedSongsData);
            console.log(likedSongsData);
            localStorage.setItem("likedSong", JSON.stringify(likedSongsData));
            // console.log(likedSongs);
          }
        }
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };
    fetchLikedSongs();
        const fetchPlaylistSongs = async () => {
          try {
            const db = getFirestore();
            if (userData && userData.uid) {
              const playlistDocRef = doc(db, "playlist", userData.uid);
              const playlistDocSnapshot = await getDoc(playlistDocRef);
              if (playlistDocSnapshot.exists()) {
                const playlistSongsData =
                  playlistDocSnapshot.data().songs || [];
                setPlaylistSongs(playlistSongsData);
                localStorage.setItem(
                  "playlist",
                  JSON.stringify(playlistSongsData)
                );
              }
            }
          } catch (error) {
            console.error("Error fetching playlist songs:", error);
          }
        };
        fetchPlaylistSongs();
        const playlistlocal = localStorage.getItem("playlist");
        setLocalPlaylist(JSON.parse(playlistlocal));
        const likedSonglocal = localStorage.getItem("likedSong");
        setLocalLiked(JSON.parse(likedSonglocal));
    // Include auth.currentUser as a dependency
  }, []);

 



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

  const playSong = (index, image, fileName, file) => {
    // Pause the previous audio player if it exists
    setHistory({
      file: file,
      image: image,
      fileName: fileName,
    });

    if (audioPlayer) {
      audioPlayer.pause();
    }
    window.document.title = `CodeWithAbdur || MelodicVerse - Your Personalized Music Experience ${fileName}`;

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

  useEffect(() => {
    const checkHistory = async () => {
      if (
        history.file !== "" &&
        history.image !== "" &&
        history.fileName !== ""
      ) {
        const db = getFirestore();
        const historyDocRef = doc(db, "history", userData.uid);

        try {
          // Get the existing document
          const historyDocSnapshot = await getDoc(historyDocRef);

          // If the document exists, update the history array
          if (historyDocSnapshot.exists()) {
            const existingHistory = historyDocSnapshot.data().history || [];
            const historyData = {
              file: history.file,
              image: history.image,
              fileName: history.fileName,
            };

            // Check if the history data already exists in the array
            const isDuplicate = existingHistory.some((item) => {
              return (
                item.file === historyData.file &&
                item.image === historyData.image &&
                item.fileName === historyData.fileName
              );
            });

            // If it's not a duplicate, update the array and set the document
            if (!isDuplicate) {
              const updatedHistory = [...existingHistory, historyData];
              await setDoc(historyDocRef, { history: updatedHistory });
              console.log("History stored successfully!");
              console.clear();
            } else {
              console.log("History data already exists, not adding duplicate.");
              console.clear();
            }
          } else {
            // If the document doesn't exist, create a new one with the history array
            const historyData = [
              {
                file: history.file,
                image: history.image,
                fileName: history.fileName,
              },
            ];

            await setDoc(historyDocRef, { history: historyData });
            console.log("History stored successfully!");
            console.clear();
          }
        } catch (error) {
          console.error("Error storing history:", error);
          console.clear();
        }
      }
    };
    checkHistory();
  }, [history, userData.uid]);

  const handleNext = (file, image, fileName) => {
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
    });
  };
  const handlePrev = (file, image, fileName) => {
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

  useEffect(() => {
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

  const handleLiked = async (index, image, fileName, title, desc) => {
    // Get the Firestore document for liked songs
    const likedSongsDocRef = doc(db, "likedSongs", userData.uid);

    try {
      // Check if the document already exists
      const likedSongsDocSnapshot = await getDoc(likedSongsDocRef);

      // If the document exists, update the liked songs array
      if (likedSongsDocSnapshot.exists()) {
        const existingLikedSongs = likedSongsDocSnapshot.data().songs || [];
        const likedSongData = {
          title: title,
          image: image,
          description: desc,
          file: fileName,
          index,
          // Add other fields as needed
        };

        // Check if the song already exists in the liked songs array
        const songExists = existingLikedSongs.some(
          (song) =>
            song.title === fileName &&
            song.image === image &&
            song.description === file,
          index
          // Add other conditions as needed to uniquely identify a song
        );

        if (!songExists) {
          // Add the new song data to the existing liked songs array
          const updatedLikedSongs = [...existingLikedSongs, likedSongData];

          // Update the document with the updated liked songs array
          await setDoc(likedSongsDocRef, { songs: updatedLikedSongs });
          console.log("Song liked successfully!");
        } else {
          console.log(
            "Song already exists in liked songs, not adding duplicate."
          );
        }
      } else {
        // If the document doesn't exist, create a new one with the liked songs array
        const likedSongData = [
          {
            title: fileName,
            image: image,
            description: file,
            index,
            // Add other fields as needed
          },
        ];

        await setDoc(likedSongsDocRef, { songs: likedSongData });
        console.log("Song liked successfully!");
      }
    } catch (error) {
      console.error("Error liking song:", error);
      // Handle error
    }
        const playlistlocal = localStorage.getItem("playlist");
        setLocalPlaylist(JSON.parse(playlistlocal));
        const likedSonglocal = localStorage.getItem("likedSong");
        setLocalLiked(JSON.parse(likedSonglocal));
  };

  const handlePlaylist = async (index, image, fileName, file) => {
    // Get the Firestore document for liked songs
    const playlistDocRef = doc(db, "playlist", userData.uid);

    try {
      // Check if the document already exists
      const playListSongsDocSnapshot = await getDoc(playlistDocRef);

      // If the document exists, update the liked songs array
      if (playListSongsDocSnapshot.exists()) {
        const existingLikedSongs = playListSongsDocSnapshot.data().songs || [];
        const likedSongData = {
          title: fileName,
          image: image,
          description: file,
          // Add other fields as needed
        };

        // Check if the song already exists in the liked songs array
        const songExists = existingLikedSongs.some(
          (song) =>
            song.title === fileName &&
            song.image === image &&
            song.description === file
          // Add other conditions as needed to uniquely identify a song
        );

        if (!songExists) {
          // Add the new song data to the existing liked songs array
          const updatedLikedSongs = [...existingLikedSongs, likedSongData];

          // Update the document with the updated liked songs array
          await setDoc(playlistDocRef, { songs: updatedLikedSongs });
          console.log("Song add playlist successfully!");
        } else {
          console.log(
            "Song already exists in add playlist songs, not adding duplicate."
          );
          console.clear();
        }
      } else {
        // If the document doesn't exist, create a new one with the liked songs array
        const likedSongData = [
          {
            title: fileName,
            image: image,
            description: file,
            // Add other fields as needed
          },
        ];

        await setDoc(playlistDocRef, { songs: likedSongData });
        console.log("Song add playlist successfully!");
        console.clear();
      }
    } catch (error) {
      console.error("Error adding song:", error);
      console.clear();
    }
        const playlistlocal = localStorage.getItem("playlist");
        setLocalPlaylist(JSON.parse(playlistlocal));
        const likedSonglocal = localStorage.getItem("likedSong");
        setLocalLiked(JSON.parse(likedSonglocal));
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

  return (
    <>
      <div>
        {/* ------------------------Alert-------------------------- */}

        {liked && (
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
                          File save click here to view folder.
                        </p>
                      </div>
                      <div className="ml-4 flex flex-shrink-0">
                        <button
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
            <div className="flex flex-col justify-center items-center text-[#fff] text-[20px] font-bold">
              <div className="mb-4 mt-8 p-2">
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
              <div className="my-4 p-2">
                <span className=" text-[#a7a6a6]">Library</span>
                <ul className="flex flex-col">
                  <div className="flex items-center mt-4">
                    <span className="mr-1">
                      <FaHistory />
                    </span>
                    <li className="my-1 cursor-pointer">History</li>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">
                      <IoMdMusicalNote />
                    </span>
                    <li className="my-1 cursor-pointer">Liked Song</li>
                  </div>
                  <div className="flex items-center">
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
                  {filteredSongs().map((song, index) => (
                    <div
                      key={song.slug.current}
                      onClick={() =>
                        playSong(
                          index,
                          song.audioimg.asset.url,
                          song.title,
                          song?.file?.asset?.url
                        )
                      }
                      className=" rounded-lg cursor-pointer select-none shadow-lg bg-white boxShadow border-black border hover:bg-[#5a0a72] transition-all duration-300"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={song.audioimg.asset.url}
                          alt={song.title? song.title : "image"}
                          className="rounded-t-lg object-cover text-white"
                        />
                      </div>
                      <div className="flex justify-between">
                        <p className="pl-2 pb-2 text-lg text-[#b3b3b3] mt-2">
                          {song.title}
                        </p>
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
                          {downloadStatus[index] ? "Downloading.." : "Download"}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <FaHeart
                          className={`text-[2rem] m-2 ${
                            likedSongs.some(
                              (likedSong) =>
                                likedSong.title === song.title &&
                                likedSong.image === song.audioimg.asset.url
                            )
                              ? "text-red-500" // Apply red color if liked
                              : "text-gray-400" // Apply gray color if not liked
                          } hover:text-[#ff5b5b]`}
                          onClick={() =>
                            handleLiked(
                              index,
                              song.audioimg.asset.url,
                              song.title,
                              song.description,
                              song.file.asset.url
                            )
                          }
                        />
                        {/* <CgPlayListCheck className="text-[3rem] m-2 text-[#646464]" /> */}
                        <CgPlayListAdd
                          className="text-[3rem] m-2 text-[#646464]"
                          onClick={() =>
                            handlePlaylist(
                              song?.file?.asset?.url,
                              song.audioimg.asset.url,
                              song.description,
                              song.title,
                              index
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="md:h-[16.6vh] fixed bottom-0 right-0 left-0">
          <div className="flex items-center justify-around h-[16.6vh] my-auto ">
            <img
              src={filteredSongs()[currentSongIndex]?.audioimg?.asset?.url}
              alt="album-cover"
              className="h-[2rem] object-cover"
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
