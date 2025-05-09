import React, { useEffect, useRef, useState } from "react";
import { FaHistory, FaSearch, FaVolumeMute } from "react-icons/fa";
import { MdPlaylistPlay } from "react-icons/md";
import "./MusicApp.css";
import oldclient from "../../lib/oldclient";
import client from "../../lib/client";
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
import { ImLoop } from "react-icons/im";
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
import { TfiArrowCircleUp } from "react-icons/tfi";
import { TfiArrowCircleDown } from "react-icons/tfi";

const MusicApp = () => {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [newSongs, setNewSongs] = useState([]);
  const [volume, setVolume] = useState(1);
  const [music, setMusic] = useState(1);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [download, setDownload] = useState(false);
  // const [liked, setLiked] = useState([]);
  const [loop, setLoop] = useState(false)
  // const [alert, setAlert] = useState(false);
  const [userData, setUserData] = useState([]);
  // const [playlist, setPlaylist] = useState([]);
  const [localLiked, setLocalLiked] = useState([]);
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [songSaved, setSongSaved] = useState(null);
  const [songExist, setSongExist] = useState(null);
  const [songRemoved, setSongRemoved] = useState(null);
  const [currentImage, setCurrentImge] = useState("")
  const [currentTitle, setCurrentTitle] = useState("")
  const [currentDesc, setCurrentDesc] = useState("")
  const [songNotRemoved, setSongNotRemoved] = useState(null);
  const isLoggedIn = localStorage.getItem("uid") != null;
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
  const [showMore, setShowMore] = useState(Array(songs.length).fill(false));
  const [pageUp, setPageUp] = useState(true);
  const [pageHeight, setPageHeight] = useState("14vh");
  const navigate = useNavigate();
  const audioRef = useRef(null); 
  const [muteAudio, setMuteAudio] = useState(true);

  const mute = () => {
    setMuteAudio(!muteAudio);
    if (muteAudio) {
      audioPlayer.volume = 0;
    } else {
      audioPlayer.volume = 1;
    }
  };

  const openPage = () => {
    setPageUp(!pageUp);
    setPageHeight(pageUp ? "16.6vh" : "70vh");
  
    // Scroll the page up when expanded
    if (!pageUp) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  

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
    console.clear();
  }, []);
  const fetchLikedSongs = async () => {
    if (!userData) {
      console.error("User data or UID is missing.");
      console.clear();
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
    console.clear();
  };

  const handleSearch = (e) => {
    setSearchQuery(searched);
    setSearched("");
  };


  const handleloop = () => {
    setLoop(prev => !prev);
  if (audioRef.current) {
    audioRef.current.loop = !loop;
  }
    console.log(loop)
  }

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
        const playlistData = playlistDocSnapshot.data().songs;
        setLocalPlaylist(playlistData);
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
    // Pause the previous audio player if it exists
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
    if (audioPlayer) {
      audioPlayer.pause();
    }
    window.document.title = `CodeWithAbdur || MelodicVerse - ${fileName} Song Your Personalized Music Experience`;

    // Set up the new audio player
    const newAudioPlayer = new Audio(file);
    setAudioPlayer(newAudioPlayer);
    setCurrentImge(image)
    setCurrentDesc(desc)
    setCurrentTitle(fileName)
    setCurrentSongIndex(index);
    setMusic(0);
    setIsPlaying(false);
    setVolume(audioPlayer ? audioPlayer.volume : volume);
    playPause();
    audioRef = newAudioPlayer;
  };
  // console.log(userData.uid);

  const checkHistory = async () => {
    // console.clear();

    if (history.file && history.image && history.fileName && history.desc) {
      const historyDocRef = doc(db, "history", userData.uid);

      try {
        const historyDocSnapshot = await getDoc(historyDocRef);
        const historyData = { ...history };

        if (historyDocSnapshot.exists()) {
          const existingHistory = historyDocSnapshot.data().history || [];
          console.log("Existing history:", existingHistory);

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
      // console.clear();
    }
  };

  const checkPlayer = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
  };

  const handleNext = () => {
    if (audioPlayer) {
      if(!loop === true){
        setAudioPlayer(
          new Audio(filteredSongs()[currentSongIndex]?.file?.asset?.url)
        );
        audioPlayer.play()
        setCurrentImge(filteredSongs()[currentSongIndex]?.audioimg?.asset?.url)
        setCurrentTitle(filteredSongs()[currentSongIndex]?.title)
        setCurrentDesc(filteredSongs()[currentSongIndex]?.description)
      }else{
        setAudioPlayer(
          new Audio(filteredSongs()[currentSongIndex + 1]?.file?.asset?.url)
        );
        setCurrentImge(filteredSongs()[currentSongIndex + 1]?.audioimg?.asset?.url)
        setCurrentTitle(filteredSongs()[currentSongIndex + 1]?.title)
        setCurrentDesc(filteredSongs()[currentSongIndex + 1]?.description)
      }
     
    }
    if(!loop === true){
      audioPlayer.pause()
      setAudioPlayer(
        new Audio(filteredSongs()[currentSongIndex]?.file?.asset?.url)
      );
      audioPlayer.play()
      setCurrentImge(filteredSongs()[currentSongIndex]?.audioimg?.asset?.url)
      setCurrentTitle(filteredSongs()[currentSongIndex]?.title)
      setCurrentDesc(filteredSongs()[currentSongIndex]?.description) 
    }else{
      setAudioPlayer(
        new Audio(filteredSongs()[currentSongIndex + 1]?.file?.asset?.url)
      );
      setCurrentImge(filteredSongs()[currentSongIndex + 1]?.audioimg?.asset?.url)
      setCurrentTitle(filteredSongs()[currentSongIndex + 1]?.title)
      setCurrentDesc(filteredSongs()[currentSongIndex + 1]?.description)
    }
    audioPlayer.pause();
    setMusic(0);
    setIsPlaying(false);
    setVolume(audioPlayer ? audioPlayer.volume : volume);
    playPause();
    // setHistory({
    //   file: file,
    //   image: image,
    //   fileName: fileName,
    //   desc: desc,
    // });
  };
  const handlePrev = (file, image, fileName, desc) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    if (currentSongIndex === 0) {
      setAudioPlayer(new Audio(filteredSongs()[0]?.file?.asset?.url));
      
      setCurrentImge(filteredSongs()[0]?.audioimg?.asset?.url)
      setCurrentTitle(filteredSongs()[0]?.title)
      setCurrentDesc(filteredSongs()[0]?.description)
      setCurrentSongIndex(0);
      setMusic(0);
      setIsPlaying(false);
      setVolume(audioPlayer ? audioPlayer.volume : volume);
      playPause();
      // setHistory({
      //   file: file,
      //   image: image,
      //   fileName: fileName,
      //   desc: desc,
      // });
      audioRef = new Audio(filteredSongs()[0]?.file?.asset?.url);
    } else {
      setAudioPlayer(
        new Audio(filteredSongs()[currentSongIndex - 1]?.file?.asset?.url)
      );
      
      setCurrentImge(filteredSongs()[currentSongIndex - 1]?.audioimg?.asset?.url)
      setCurrentTitle(filteredSongs()[currentSongIndex - 1]?.title)
      setCurrentDesc(filteredSongs()[currentSongIndex - 1]?.description)
      setCurrentSongIndex(currentSongIndex - 1);
      setMusic(0);
      setIsPlaying(false);
      setVolume(audioPlayer ? audioPlayer.volume : volume);
      playPause();
      // setHistory({
      //   file: file,
      //   image: image,
      //   fileName: fileName,
      //   desc: desc,
      // });
      audioRef = new Audio(filteredSongs()[currentSongIndex - 1]?.file?.asset?.url);
    }
  };

  useEffect(() => {
    if (audioPlayer) {
      const handleLoadedMetadata = () => {
        audioPlayer.currentTime = music * audioPlayer.duration;
      };

      const handleEnded = () => {
        if (audioPlayer) {
          if(!loop === true){
            setAudioPlayer(
              new Audio(filteredSongs()[currentSongIndex]?.file?.asset?.url)
            );
            setCurrentImge(filteredSongs()[currentSongIndex]?.audioimg?.asset?.url)
            setCurrentTitle(filteredSongs()[currentSongIndex]?.title)
            setCurrentDesc(filteredSongs()[currentSongIndex]?.description)
            audioPlayer.play()
          }else{
            setAudioPlayer(
              new Audio(filteredSongs()[currentSongIndex + 1]?.file?.asset?.url)
            );
            setCurrentImge(filteredSongs()[currentSongIndex + 1]?.audioimg?.asset?.url)
            setCurrentTitle(filteredSongs()[currentSongIndex + 1]?.title)
            setCurrentDesc(filteredSongs()[currentSongIndex + 1]?.description)
          }
         
        }
        if(!loop === true){
          audioPlayer.pause()
          setAudioPlayer(
            new Audio(filteredSongs()[currentSongIndex]?.file?.asset?.url)
          );
          audioPlayer.play()
          setCurrentImge(filteredSongs()[currentSongIndex]?.audioimg?.asset?.url)
          setCurrentTitle(filteredSongs()[currentSongIndex]?.title)
          setCurrentDesc(filteredSongs()[currentSongIndex]?.description)
        }else{
          setAudioPlayer(
            new Audio(filteredSongs()[currentSongIndex + 1]?.file?.asset?.url)
          );
          setCurrentImge(filteredSongs()[currentSongIndex + 1]?.audioimg?.asset?.url)
          setCurrentTitle(filteredSongs()[currentSongIndex + 1]?.title)
          setCurrentDesc(filteredSongs()[currentSongIndex + 1]?.description)
        }
        audioPlayer.pause();
        setMusic(0);
        setIsPlaying(false);
        setVolume(audioPlayer ? audioPlayer.volume : volume);
        playPause();
        // setHistory({
        //   file: filteredSongs()[currentSongIndex + 1]?.file?.asset?.url,
        //   image: filteredSongs()[currentSongIndex + 1]?.audioimg?.asset?.url,
        //   fileName: filteredSongs()[currentSongIndex + 1]?.title,
        //   desc: desc,
        // });
      };

      audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioPlayer.addEventListener("ended", handleEnded);

      return () => {
        audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioPlayer.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioPlayer, music]);
 
  const playSongAtIndex = (index) => {
    const song = filteredSongs()[index];
    if (!song) return;
  
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  
    const newAudio = new Audio(song.file.asset.url);
    audioRef.current = newAudio;
    setCurrentSongIndex(index);
    newAudio.play();
  };
  
 
  
  useEffect(() => {
    const fetchNewSongs = () => {
      client
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
        .then((newData) => {
          setNewSongs(newData); // Update state
          fetchSongs(newData); // Pass data directly
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const fetchSongs = (newData) => {
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
        .then((oldData) => {
          const combined = [...oldData, ...newData]; // Combine directly
          setSongs(combined); // Set combined data
          setCurrentImge(combined[0]?.audioimg?.asset?.url); // Set the first image
          setCurrentTitle(combined[0]?.title); // Set the first title
          setCurrentDesc(combined[0]?.description); // Set the first description
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchNewSongs();
  }, []);

  useEffect(() => {
    checkHistory();
    fetchPlaylistSongs();
    fetchLikedSongs();
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
    let filtered = songs;

  
    // Filter by search query (title, description, or category)
    if (searchQuery) {
      filtered = filtered.filter((song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.category.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

   
  
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((song) =>
        song.category.includes(selectedCategory)
      );
    }
  
    return filtered;
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
          console.log("Song removed from playlist successfully!");
          setSongRemoved("Song removed from playlist successfully!");
          setTimeout(() => {
            setSongRemoved(null);
          }, 2000);
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
      setSongNotRemoved(
        "Sorry might be internet Issues or userData is Not Found!"
      );
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
      setSongNotRemoved(
        "Sorry might be internet Issues or userData is Not Found!"
      );
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
        <div className="flex h-[70vh]">
          <div className="sideBar md:w-[20vw] w-[40vw]">
            <div className="flex flex-col md:justify-center justify-start md:items-center items-end text-[#fff] text-[20px] font-bold">
              <div className="search flex justify-center h-[40px] items-center">
                <input
                  type="text"
                  className="rounded-l-lg border-r-2 border-[#111] bg-[#e3e3e3] w-[80%] text-[#111] p-2 outline-none"
                  value={searched}
                  onChange={(e) => setSearched(e.target.value) }
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                <span onClick={handleSearch} className="bg-[#e3e3e3] cursor-pointer h-[47px] w-[40px] rounded-r-lg flex items-center justify-center">
                  <FaSearch type="submit" onSubmit={handleSearch} className="text-[#111] cursor-pointer" />
                </span>
              </div>
              <div className="mb-4 md:mt-8 p-2">
                <span className=" text-[#a7a6a6]">Browse</span>
                <ul className="flex flex-col">
                  <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => setSelectedCategory("All")}
                  >
                    All
                  </li>
                  <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => setSelectedCategory("New Release")}
                  >
                    New Release
                  </li>
                  <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => setSelectedCategory("Top Playlist")}
                  >
                    Top Playlist
                  </li>
                  <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => setSelectedCategory("Old Playlist")}
                  >
                    Old PlayList
                  </li>
                  <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => setSelectedCategory("Dance Song")}
                  >
                    Dance Song
                  </li>
                  <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => setSelectedCategory("English")}
                  >
                    English Song
                  </li>
                  {/* <li
                    className="my-1 cursor-pointer hover:text-[#623cca] transition-all"
                    onClick={() => navigate(`/english`)}
                  >
                    English Song
                  </li> */}
                </ul>
              </div>
              {isLoggedIn ? (
                <div className="md:my-4 hidden p-2">
                  <span className=" text-[#a7a6a6]">Library</span>
                  <ul className="flex flex-col">
                    <div
                      className="flex items-center mt-4 hover:text-[#623cca] transition-all"
                      onClick={() => {
                        navigate(`/history`);
                        checkPlayer();
                      }}
                    >
                      <span className="mr-1">
                        <FaHistory />
                      </span>
                      <li className="my-1 cursor-pointer ">History</li>
                    </div>
                    <div
                      className="flex items-center hover:text-[#623cca] transition-all"
                      onClick={() => {
                        navigate(`/likedpage`);
                        checkPlayer();
                      }}
                    >
                      <span className="mr-1">
                        <FaHeart />
                      </span>
                      <li className="my-1 cursor-pointer ">Liked</li>
                    </div>
                    <div
                      className="flex items-center md:mb-0 mb-6 hover:text-[#623cca] transition-all"
                      onClick={() => {
                        navigate(`/playlistpage`);
                        checkPlayer();
                      }}
                    >
                      <span className="mr-1">
                        <MdPlaylistPlay />
                      </span>
                      <li className="my-1 cursor-pointer ">PlayList</li>
                    </div>
                  </ul>
                </div>
              ) : (
                <div className="md:my-4 hidden p-2">
                  <span className=" text-[#a7a6a6]">Library</span>
                  <ul className="flex flex-col">
                    <div
                      className="flex items-center mt-4"
                      onClick={() => {
                        navigate(`/login`);
                        checkPlayer();
                      }}
                    >
                      <span className="mr-1">
                        <FaHistory />
                      </span>
                      <li className="my-1 cursor-pointer">History</li>
                    </div>
                    <div
                      className="flex items-center"
                      onClick={() => {
                        navigate(`/login`);
                        checkPlayer();
                      }}
                    >
                      <span className="mr-1">
                        <FaHeart />
                      </span>
                      <li className="my-1 cursor-pointer">Liked</li>
                    </div>
                    <div
                      className="flex items-center md:mb-0 mb-6"
                      onClick={() => {
                        navigate(`/login`);
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
              )}
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
                  {filteredSongs()
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((song, index) => {
                      const isSongInPlaylist = localPlaylist.some(
                        (playlist) => playlist.description === song.title
                      );
                      const isSongInLiked = localLiked.some(
                        (liked) => liked.title === song.title
                      );
                      return (
                        <div
                          key={song.slug.current}
                          onClick={() => {
                            playSong(
                              index,
                              song.audioimg.asset.url,
                              song.title,
                              song?.file?.asset?.url,
                              song?.description
                            )}
                          }
                          className=" rounded-lg cursor-pointer select-none shadow-lg bg-white boxShadow border-black border hover:bg-[#5a0a72] transition-all duration-300"
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={song.audioimg.asset.url}
                              alt={song.title ? song.title : "image"}
                              className="rounded-t-lg object-cover h-[15rem] w-full text-white"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col justify-between">
                            <p className="pl-2 pb-2 text-[15px] font-bold text-[#b3b3b3] mt-2">
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
                            {isLoggedIn ? (
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
                            ) : (
                              <button
                                className="downloadButton mr-1 my-2"
                                onClick={() => navigate(`/login`)}
                              >
                                Download
                              </button>
                            )}
                          </div>
                          {isLoggedIn ? (
                            <div className={` ${!pageUp ? "hidden": "flex"} hidden justify-between z-10`}>
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
                                  className={`text-[2rem] ${!pageUp ? "hidden": "flex"} m-2 text-[#646464] cursor-pointer z-40`}
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
                          ) : (
                            <div className={`${!pageUp ? "hidden": "flex"} hidden justify-between z-10`}>
                              {isSongInLiked ? (
                                <FaHeart
                                  onClick={() => navigate(`/login`)}
                                  className="text-[2rem] m-2 text-[#ff2d2d] "
                                />
                              ) : (
                                <FaHeart
                                  onClick={() => navigate(`/login`)}
                                  className="text-[2rem] m-2 text-[#efe9e9] z-40"
                                />
                              )}
                              {isSongInPlaylist ? (
                                <CgPlayListCheck
                                  onClick={() => navigate(`/login`)}
                                  className="text-[2rem] m-2 text-[#646464] cursor-pointer z-40"
                                />
                              ) : (
                                <CgPlayListAdd
                                  className="text-[2rem] m-2 text-[#646464] z-40"
                                  onClick={() => navigate(`/login`)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>)}
        </div>

        {/* ----------------------Song bottom -------progress */}


        <div className={`fixed bg-[#000] bottom-0 right-0 left-0 z-30 transition-all duration-500 ease-in-out ${!pageUp ? "h-[70vh]" : "h-[16.6vh]"}`}>
      {/* Toggle Button */}
      {!pageUp ? (
        <TfiArrowCircleDown onClick={openPage} className="absolute right-4 -top-2 text-[#fff] text-[30px] cursor-pointer" />
      ) : (
        <TfiArrowCircleUp onClick={openPage} className="absolute right-4 -top-2 text-[#fff] text-[30px] cursor-pointer" />
      )}

      {/* Content */}
      <div className={`flex ${pageUp ? "flex-row" : "flex-col" } items-center justify-evenly w-full h-full`}>
        {/* Description - Visible when expanded */}
        {!pageUp && (
          <div className="text-center text-white mb-1">
            <h2 className="text-[30px] uppercase font-bold mt-2">Now Playing</h2>
          </div>
        )}

        {/* Music Controls */}
        <div className={`flex ${pageUp ? "flex-row" : "flex-col" } items-center justify-evenly  overflow-scroll `}>
          {/* Song Image */}
          <img
            src={currentImage || "/default-image.png"}
            alt={currentTitle || "Song Image"}
            className={`w-[4rem] aspect-square my-2 object-cover rounded-full ${isPlaying ? "animate-spin" : ""}`}
          />

          {/* Song Title */}
          <span className={`text-white ${!pageUp ? "ml-6" : "hidden"} font-[900] md:text-[14px]`}>{currentTitle}</span>

          {/* Song Description */}

          {!pageUp && (<p className="text-sm opacity-70 w-[50%] text-[#fff] mt-[12px] mx-auto">{`${currentDesc}....` || "Enjoy your music!"}</p>) }
         
         
        </div>
        <div className={`flex my-6 items-center h-[8vh]  gap-4`}>

{/* Previous Button */}
<SkipPrevious className="cursor-pointer text-white text-[20px] mt-3" onClick={() => handlePrev()} />

{/* Play/Pause Button */}
<span onClick={playPause} className="cursor-pointer">
  {isPlaying ? <Pause className="text-white text-[40px] mt-3" /> : <PlayArrow className="text-white text-[40px] mt-3" />}
</span>

{/* Next Button */}
<SkipNext className="cursor-pointer text-white text-[20px] mt-3" onClick={() => handleNext()} />

  <span className={`text-[20px] mt-3 cursor-pointer ${!loop ? "text-[#1cff64]" : "text-[#fff]"}`}>
    <ImLoop  onClick={handleloop}/>
  </span>


        {/* Volume & Progress Bar */}
        <div className="flex items-center mt-4 gap-4">
          {/* Mute Button */}
          {muteAudio ? (
            <VolumeUp className="cursor-pointer text-white text-[30px]" onClick={mute} />
          ) : (
            <FaVolumeMute className="cursor-pointer text-white text-[30px]" onClick={mute} />
          )}


          {/* Volume Slider */}
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="md:w-[100px] cursor-pointer" />

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audioPlayer ? currentTime / audioPlayer.duration || 0 : 0}
            onChange={handleMusicChange}
            className={`${pageUp ? "md:w-[600px] w-[100px]" : `md:w-[700px] w-[50px]`} cursor-pointer`}
          />
          
        </div>
        </div>
      </div>
    </div>


        {/* ---------------------------End Song Progress--------------------- */}
      </div>
    </>
  );
};

export default MusicApp;
