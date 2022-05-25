
import './App.css';
import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { Route, BrowserRouter as Router } from 'react-router-dom';


import MainText from './MainText';
import TopBar from './TopBar';
import BottomBar from './BottomBar';

const romanpat = /^[^:]*/

const domain = 'https://beowulf.ue.r.appspot.com/'
const api = axios.create({
  baseURL: domain
})

const rawversions = {
  "Original": "as",
  "Gummere": "g",
  "Morris": "mw",
  "Kirtlan": "p",
}

function App() {
  const [version, setVersion] = useState('as');
  const [chapter, setChapter] = useState(1);
  const [chaptertitles, setChapterTitles] = useState({})
  const [chapternums, setChapterNums] = useState([])
  const [versions, setVersions] = useState(rawversions)

  const getChaps = useCallback(async () => {
    let res = await fetch(domain + 'm')
    res = await res.json()
    setChapterTitles(res)
    setChapterNums(Object.keys(res))
  }, [])

  useEffect(() => {
    getChaps()
  }, [])

  return (
    <>
    <TopBar key={"topbar"} version={version} versions={versions} chapter={chapter} chapternums={chapternums} chaptertitles={chaptertitles} onVersionChange={setVersion} onChapterChange={setChapter}/>
    <Router>
      <MainText key={"maintext"} version={version} chapter={chapter} chaptertitles={chaptertitles} domain={domain}/>
    </Router>
    <BottomBar key={"bottombar"} chapter={chapter} chapternums={chapternums} versions={versions} onVersionChange={setVersion} onChapterChange={setChapter}/>
    </>
  );
}


export default App;
