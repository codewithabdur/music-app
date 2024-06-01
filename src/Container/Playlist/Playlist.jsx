import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FaHeart, FaHistory, FaHome } from "react-icons/fa";
import { CgPlayListAdd } from "react-icons/cg";
import {
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from "@material-ui/icons";
import { MdPlaylistPlay } from "react-icons/md";
import { IoMdMusicalNote } from "react-icons/io";
import { DNA } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const Playlist = () => {
  const [userData, setUserData] = useState(null);
  const [playlistSongs, setPlaylistSong] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0); // Initialize index state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [music, setMusic] = useState(1);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const navigate = useNavigate();

  const playPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

   useEffect(() => {
     if (audioPlayer) {
       audioPlayer.addEventListener("timeupdate", handleTimeUpdate);

       return () => {
         audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
       };
     }
   }, [audioPlayer]);

   const handleTimeUpdate = () => {
     setCurrentTime(audioPlayer.currentTime);
   };

  useEffect(() => {
    const fetchUserDataAndHistory = async () => {
      try {
        const userEmail = localStorage.getItem("user");

        if (!userEmail) {
          setError("No user email found in localStorage");
          setLoading(false);
          return;
        }

        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No matching user found");
          setLoading(false);
          return;
        }

        const data = querySnapshot.docs[0].data();
        setUserData(data);

        const historyDocRef = doc(db, "playlist", data.uid);
        const playlistSongsDocSnapshot = await getDoc(historyDocRef);

        if (playlistSongsDocSnapshot.exists()) {
          const playlistSongsData = playlistSongsDocSnapshot.data().songs || [];
          setPlaylistSong(playlistSongsData);
          localStorage.setItem("playlist", JSON.stringify(playlistSongsData));
        } else {
          setError("No history found for this user");
        }
      } catch (err) {
        setError("An error occurred while fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndHistory();
  }, []);

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    if (audioPlayer) {
      audioPlayer.volume = newVolume;
    }
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

  const playSong = (url, title, image, index) => {
    // Pause the previous audio player if it exists
    if (audioPlayer) {
      audioPlayer.pause();
    }
    window.document.title = `CodeWithAbdur || MelodicVerse - ${title} Song Your Personalized Music Experience`;

    // Set up the new audio player with the correct URL
    const newAudioPlayer = new Audio(url);
    setAudioPlayer(newAudioPlayer);
    setIndex(index);
    setIsPlaying(false);
    setMusic(0);
    setVolume(newAudioPlayer ? newAudioPlayer.volume : volume);
    playPause();
  };

  const handleNext = () => {
    if (index < playlistSongs.length - 1) {
      setIndex(index + 1);
      playSong(
        playlistSongs[index + 1]?.file,
        playlistSongs[index + 1]?.title,
        playlistSongs[index + 1]?.image,
        index + 1
      );
      setMusic(0);
    } else {
      // Optionally, you can loop back to the beginning when reaching the end
      setIndex(0);
      playSong(
        playlistSongs[0]?.file,
        playlistSongs[0]?.title,
        playlistSongs[0]?.image,
        0
      );
      setMusic(0);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      playSong(
        playlistSongs[index - 1]?.file,
        playlistSongs[index - 1]?.title,
        playlistSongs[index - 1]?.image,
        index - 1
      );
      setMusic(0);
    } else {
      // Optionally, you can go to the last song when pressing previous on the first song
      setIndex(playlistSongs.length - 1);
      playSong(
        playlistSongs[playlistSongs.length - 1]?.file,
        playlistSongs[playlistSongs.length - 1]?.title,
        playlistSongs[playlistSongs.length - 1]?.image,
        playlistSongs.length - 1
      );
      setMusic(0);
    }
  };
  const checkPlayer = () => {
    if (audioPlayer) {
      audioPlayer.pause();
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
            new Audio(playlistSongs[index + 1]?.file)
          );
          setIndex(index + 1);
          setMusic(0);
          setIsPlaying(false);
          setVolume(audioPlayer ? audioPlayer.volume : volume);
          playPause()
        };

        audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
        audioPlayer.addEventListener("ended", handleEnded);

        return () => {
          audioPlayer.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );
          audioPlayer.removeEventListener("ended", handleEnded);
        };
      }
    }, [audioPlayer, music]);
  if (loading) {
    return (
      <div className="h-screen bg-[#111] w-full flex justify-center items-center">
        <DNA
          visible={true}
          height="150"
          width="150"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperclassName="dna-wrapper"
        />
      </div>
    );
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div className=" w-full bg-[#111]">
      <div className="p-7 flex">
        <div className="sideBar md:w-[20vw] w-[30vw] ">
          <div className="flex flex-col justify-center items-center text-[#fff] text-[20px] font-bold">
            <div className="my-4 p-2">
              <span className=" text-[#a7a6a6]">Library</span>
              <ul className="flex flex-col justify-evenly min-h-[70vh]">
                <div
                  className="flex items-center"
                  onClick={() => {
                    navigate(`/`);
                    checkPlayer();
                  }}
                >
                  <span className="mr-1">
                    <FaHome />
                  </span>
                  <li className="my-1 cursor-pointer">Home</li>
                </div>
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
                  className="flex items-center"
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
        <div className="w-[70vw] md:w-[80vw]">
          {playlistSongs.length > 0 && (
            <div className="heroSection w-[70vw] md:w-[80vw] h-[70vh] overflow-scroll">
              <div className="md:w-[75vw] w-[65vw] mx-auto h-full">
                <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto ">
                  {playlistSongs.map((song, songIndex) => (
                    <div
                      onClick={() => {
                        playSong(
                          playlistSongs[songIndex]?.file,
                          playlistSongs[songIndex]?.title,
                          playlistSongs[songIndex]?.image,
                          songIndex
                        );
                      }}
                      key={song.file}
                      className=" rounded-lg cursor-pointer select-none shadow-lg bg-white boxShadow border-black border hover:bg-[#5a0a72] transition-all duration-300"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={song.image}
                          alt={song.title ? song.title : "image"}
                          className="rounded-t-lg object-cover text-white"
                        />
                      </div>
                      <div className="flex justify-between">
                        <p className="pl-2 pb-2 text-lg text-[#b3b3b3] mt-2">
                          {song.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="md:h-[16.6vh] fixed bottom-0 right-0 left-0">
        <div className="flex items-center justify-around h-[16.6vh] my-auto ">
          <img
            src={playlistSongs[index]?.image}
            alt={
              playlistSongs[index] ? playlistSongs[index]?.title : "song image"
            }
            className="h-[2rem] object-cover text-white"
          />
          <SkipPrevious
            style={{ fontSize: 40, color: "#fff" }}
            onClick={handlePrev}
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
            onClick={handleNext}
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
              value={audioPlayer ? currentTime / audioPlayer.duration || 0 : 0} // Ensure division by zero is handled
              onChange={handleMusicChange}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlist;
