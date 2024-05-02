import './code-cell.css';
import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';
import { useTypedSelector } from '../hooks/use-typed-selector';

interface CodeCellProps {
  cell: Cell;
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const { updateCell, createBundle } = useActions();
  const bundle = useTypedSelector((state) => state.bundles[cell.id]);
  const cumlativeCode = useTypedSelector((state) => {
    const { data, order } = state.cells;
    const orderedCells = order.map((id) => data[id]);

    const showFunc = `
    import _React from 'react';
        import _ReactDOM from 'react-dom';
          var show = (value) => {
          const root = document.querySelector('#root');

          if (typeof value === 'object') {
            if (value.$$typeof && value.props) {
              _ReactDOM .render(value, root);
            } else {
              root.innerHTML = JSON.stringify(value);
            }
            
          } else {
            root.innerHTML = value;
          }
          
        };`;
    const cumlativeCode = [];
    const showFuncNoop = 'var show = () => {}'; // show function that clears prior code cells using show

    for (let c of orderedCells) {
      // going through ordered cells and getting all prior code cells to accumlate them
      if (c.type === 'code') {
        if (c.id === cell.id) {
          // if cell is the cell we're trying to execute, add the show function with actual logic
          cumlativeCode.push(showFunc);
        } else {
          // if cell is a prior cell, add show function that does nothing to clear show function calls by this prior cell
          cumlativeCode.push(showFuncNoop);
        }
        cumlativeCode.push(c.content);
      }
      if (c.id === cell.id) {
        // if we reach the cell that we are rendering, stop
        break;
      }
    }
    return cumlativeCode;
  });

  useEffect(() => {
    if (!bundle) {
      createBundle(cell.id, cumlativeCode.join('\n'));
      return;
    }

    const timer = setTimeout(async () => {
      createBundle(cell.id, cumlativeCode.join('\n'));
    }, 1000);

    return () => {
      clearTimeout(timer); // clearing timer if user input is updated before 1 second passes
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell.id, cumlativeCode.join('\n'), createBundle]);

  return (
    <Resizable direction="vertical">
      <div
        style={{
          height: 'calc(100% - 10px)',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Resizable direction="horizontal">
          <CodeEditor
            initalValue={cell.content}
            onChange={(value) => updateCell(cell.id, value)}
          />
        </Resizable>
        <div className="progress-background">
          {!bundle || bundle.loading ? (
            <div className="progress-cover">
              <progress className="progress is-small is-primary" max="100">
                Loading
              </progress>
            </div>
          ) : (
            <Preview code={bundle.code} bundlingError={bundle.err} />
          )}
        </div>
      </div>
    </Resizable>
  );
};

export default CodeCell;
