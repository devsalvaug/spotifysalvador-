import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import Footer from "./Footer";
import Navbar from "./Navbar";
import axios from "axios";
import { useStateProvider } from "../utils/StateProvider";
import Body from "./Body";
import { reducerCases } from "../utils/Constants";

import SpotifyWebApi from 'spotify-web-api-js';


export default function Spotify() {


  const [{ token }, dispatch] = useStateProvider();

  const [navBackground, setNavBackground] = useState(false);
  const [headerBackground, setHeaderBackground] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const bodyRef = useRef();


  const spotifyApi = new SpotifyWebApi({
    clientId: '5ae22102558647e99c015cfb49acb3c0',
    clientSecret: 'fd135b0075cb4ac8851099839237c5af',
    accessToken: token

  });

  const bodyScrolled = () => {
    bodyRef.current.scrollTop >= 30
      ? setNavBackground(true)
      : setNavBackground(false);
    bodyRef.current.scrollTop >= 268
      ? setHeaderBackground(true)
      : setHeaderBackground(false);
  };
  useEffect(() => {
    const getUserInfo = async () => {
      const { data } = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });
      const userInfo = {
        userId: data.id,
        userUrl: data.external_urls.spotify,
        name: data.display_name,
      };
      dispatch({ type: reducerCases.SET_USER, userInfo });
    };
    getUserInfo();
  }, [dispatch, token]);
  useEffect(() => {
    const getPlaybackState = async () => {
      const { data } = await axios.get("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });
      dispatch({
        type: reducerCases.SET_PLAYER_STATE,
        playerState: data.is_playing,
      });
    };
    getPlaybackState();
  }, [dispatch, token]);


  function buscarArtistas(terminoBusqueda) {
    axios.get(`https://api.spotify.com/v1/search?type=artist&q=${terminoBusqueda}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log("dataartist", response.data.artists.items[0]);
        let dataartist = response.data.artists.items[0]

        handleTopTracks(dataartist)

      })
      .catch(error => {
        console.log("erors", error);
      });
  }


  const handleTopTracks = async (artist) => {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=es`,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("toptracks", response.data.tracks)
    console.log("dataarteeee", artist)
    const selectedPlaylist = {
      id: artist.id,
      name: artist.name,
      description: "",
      image: artist.images[0].url,
      tracks: response.data.tracks.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        image: track.album.images[2].url,
        duration: track.duration_ms,
        album: track.album.name,
        context_uri: track.album.uri,
        track_number: track.track_number,
      })),
    };
    console.log("asdasda", selectedPlaylist)

    dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist });

  }


  function ManejarSubmit(evento) {
    evento.preventDefault();
    buscarArtistas(terminoBusqueda);
  }

  function ManejarCambio(evento) {
    setTerminoBusqueda(evento.target.value);
  }

  return (
    <Container>
      <div className="spotify__body">
        <Sidebar />
        <div className="body" ref={bodyRef} onScroll={bodyScrolled}>
          <Navbar navBackground={navBackground} ManejarSubmit={ManejarSubmit} terminoBusqueda={terminoBusqueda} ManejarCambio={ManejarCambio} />
          <div className="body__contents">
            <Body headerBackground={headerBackground} />
          </div>
        </div>
      </div>
      <div className="spotify__footer">
        <Footer />
      </div>
    </Container>
  );
}

const Container = styled.div`
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: 85vh 15vh;
  .spotify__body {
    display: grid;
    grid-template-columns: 15vw 85vw;
    height: 100%;
    width: 100%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 1));
    background-color: rgb(32, 87, 100);
    .body {
      height: 100%;
      width: 100%;
      overflow: auto;
      &::-webkit-scrollbar {
        width: 0.7rem;
        max-height: 2rem;
        &-thumb {
          background-color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
`;
