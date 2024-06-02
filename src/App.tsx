import { useEffect, useState } from "react";
import { Section } from "./Section"
import './App.css';


const images = [
  { src: '/pic01.png', aspectRatio: (292 + 12) / (397 + 12) },
  { src: '/pic02.png', aspectRatio: (306 + 12) / (193 + 12) },
  { src: '/pic03.png', aspectRatio: (447 + 12) / (295 + 12) },
  { src: '/pic04.png', aspectRatio: (222 + 12) / (295 + 12) },
  { src: '/pic05.png', aspectRatio: (505 + 12) / (296 + 12) },
  { src: '/pic06.png', aspectRatio: (280 + 12) / (295 + 12) },
  { src: '/pic07.png', aspectRatio: (292 + 12) / (350 + 12) },
  { src: '/pic08.png', aspectRatio: (297 + 12) / (242 + 12) },
  { src: '/pic09.png', aspectRatio: (306 + 12) / (617 + 12) },
];

const columns = new Array(10000).fill(true)
  .map(() => images[Math.floor(Math.random() * (images.length - 0.00001))]);

export default () => {
  const [columns2, setColumns2] = useState<typeof columns>([]);
  useEffect(() => {
    const aspectRatios = new Array(30).fill(true).map(() => 0.3 + Math.random() * 3)
    const getSelection = aspectRatios.map((aspectRatio) => {
        if (aspectRatio <= 1) {
          const height = 900;
          const width = Math.floor(height * aspectRatio);
          return [width, height];
        } else {
          const width = 900;
          const height = Math.floor(width / aspectRatio);
          return [width, height];
        }
      })
      .map(([width, height]) => fetch(`https://picsum.photos/${width}/${height}`));

    Promise.all(getSelection)
      .then((responses) => responses.map((res) => res.url))
      .then((urls) => {
        const selection = aspectRatios.map((aspectRatio, ix) => ({ src: urls[ix], aspectRatio }));
        const columns2 = new Array(10000).fill(true)
          .map(() => selection[Math.floor(Math.random() * (selection.length - 0.00001))]);
        setColumns2(columns2);
      });
  }, []);

  return (
    <div className="app-root">
      <Section columns={columns} />
      <Section columns={columns2} />
    </div>
  );
}