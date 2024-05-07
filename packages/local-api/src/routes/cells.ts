import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

interface LocalApiError {
  code: string;
}

const defaultCells = [
  {
    content:
      'JSNote-Zeina\n----------\nThis is an interactive coding environment. You can write Javascript, see it executed, and write coprehensive documentation using markdown.\n\n- Click any text cell (including this one) to edit it\n- The code in each code editor is all joined into one file. If you define a variable in cell #1, you can refer to it in any following code cell!\n- You can show any React component, string, number, or anything else by calling the `show `function. This is a function built into this environment. Call show multiple times to show multiple values\n- Re-order or delete cells using the buttons on the top right \n- Add new cells by hovering on the divider between each cell\n\nAll of your changes get saved to the file you opened Jbook with. So if you ran `npx jsnote-zeina serve test.js` , all of the text and code you write will be saved to the `test.js` file.',
    type: 'text',
    id: 'ohbrr',
  },
  {
    content:
      "import { useState } from 'react';\r\nconst Counter = () => {\r\n  const [count, setCount] = useState(0);\r\n  return (\r\n    <div>\r\n      <button onClick={() => setCount(count + 1)}>Click </button>\r\n      <h3>Count: {count} </h3>\r\n    </div>\r\n  );\r\n};\r\n\r\nshow(<Counter />);",
    type: 'code',
    id: 'yvorb',
  },
  {
    content:
      'const App = () => {\r\n  return (\r\n    <div>\r\n      <h3> App says Hello </h3>\r\n      <i> Counter component will be rendered below... </i>\r\n      <hr />\r\n      {/* Counter was declared in an earlier cell -\r\n  We can reference it here! */}\r\n      <Counter />\r\n    </div>\r\n  );\r\n};\r\n\r\nshow(<App />);',
    type: 'code',
    id: 'toeeq',
  },
];

export const createCellsRouter = (filename: string, dir: string) => {
  const router = express.Router();
  router.use(express.json());

  const fullPath = path.join(dir, filename);

  router.get('/cells', async (req, res) => {
    const isLocalApiError = (err: any): err is LocalApiError => {
      return typeof err.code === 'string';
    };

    try {
      // Read the file
      const result = await fs.readFile(fullPath, { encoding: 'utf-8' });

      res.send(JSON.parse(result));
    } catch (err) {
      if (isLocalApiError(err)) {
        if (err.code === 'ENOENT') {
          // Create a file and add default cells
          const newFile = await fs.writeFile(
            fullPath,
            JSON.stringify(defaultCells),
            'utf-8'
          );
          res.send(JSON.stringify(defaultCells));
        } else {
          throw err;
        }
      }
    }

    // If read throws an error
    // Insprect the error, see if it says that file doesn't exist

    // Parse a list of cells out of it
    // Send list of cells back to browser
  });

  router.post('/cells', async (req, res) => {
    // Take the list of cells from the request obj
    // Serialize them
    const { cells }: { cells: Cell[] } = req.body;

    // Write cells into the file
    await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');

    res.send({ status: 'ok' });
  });

  return router;
};
