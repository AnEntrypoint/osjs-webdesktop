export const createTextEditorApp = (osjs) => {
  const sessionManager = osjs.make('osjs/session-manager');

  sessionManager.registerAppSerializer('text-editor', {
    serialize: (win) => {
      const textarea = win.$content.querySelector('textarea');

      return {
        content: textarea?.value || '',
        cursorPosition: textarea?.selectionStart || 0,
        scrollTop: textarea?.scrollTop || 0,
        filePath: win.attributes.filePath || null
      };
    },

    deserialize: async (osjs, windowState, appState) => {
      const win = osjs.make('osjs/window', {
        title: windowState.title || 'Text Editor',
        position: windowState.position,
        dimension: windowState.dimension,
        attributes: {
          appType: 'text-editor',
          filePath: appState.filePath
        }
      });

      win.render();

      const textarea = document.createElement('textarea');
      textarea.style.width = '100%';
      textarea.style.height = '100%';
      textarea.style.border = 'none';
      textarea.style.resize = 'none';
      textarea.style.fontFamily = 'monospace';
      textarea.style.padding = '10px';
      textarea.value = appState.content || '';

      win.$content.appendChild(textarea);

      setTimeout(() => {
        textarea.selectionStart = appState.cursorPosition || 0;
        textarea.selectionEnd = appState.cursorPosition || 0;
        textarea.scrollTop = appState.scrollTop || 0;
        textarea.focus();
      }, 100);

      return win;
    }
  });

  return {
    open: (filePath = null) => {
      const win = osjs.make('osjs/window', {
        title: filePath ? `Text Editor - ${filePath}` : 'Text Editor',
        dimension: { width: 600, height: 400 },
        attributes: {
          appType: 'text-editor',
          filePath
        }
      });

      win.render();

      const textarea = document.createElement('textarea');
      textarea.style.width = '100%';
      textarea.style.height = '100%';
      textarea.style.border = 'none';
      textarea.style.resize = 'none';
      textarea.style.fontFamily = 'monospace';
      textarea.style.padding = '10px';
      textarea.placeholder = 'Start typing...';

      if (filePath) {
        osjs.make('osjs/vfs').readfile(filePath, 'text')
          .then(content => {
            textarea.value = content;
          })
          .catch(err => {
            console.error('Failed to load file:', err);
          });
      }

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.style.margin = '10px';
      saveButton.onclick = async () => {
        if (filePath) {
          try {
            await osjs.make('osjs/vfs').writefile({ path: filePath }, textarea.value);
            osjs.make('osjs/notification', {
              message: `Saved to ${filePath}`
            });
          } catch (err) {
            osjs.make('osjs/notification', {
              message: `Save failed: ${err.message}`,
              type: 'error'
            });
          }
        }
      };

      win.$content.appendChild(saveButton);
      win.$content.appendChild(textarea);

      return win;
    }
  };
};

export const createCalculatorApp = (osjs) => {
  const sessionManager = osjs.make('osjs/session-manager');

  sessionManager.registerAppSerializer('calculator', {
    serialize: (win) => {
      const display = win.$content.querySelector('.calc-display');

      return {
        displayValue: display?.value || '0',
        history: win.attributes.history || []
      };
    },

    deserialize: async (osjs, windowState, appState) => {
      const calc = createCalculatorApp(osjs);
      const win = calc.open();

      const display = win.$content.querySelector('.calc-display');
      if (display) {
        display.value = appState.displayValue || '0';
      }

      win.attributes.history = appState.history || [];

      win.setPosition(windowState.position);
      win.setDimension(windowState.dimension);

      if (windowState.maximized) {
        win.maximize();
      }

      return win;
    }
  });

  return {
    open: () => {
      const win = osjs.make('osjs/window', {
        title: 'Calculator',
        dimension: { width: 300, height: 400 },
        attributes: {
          appType: 'calculator',
          history: []
        }
      });

      win.render();

      const display = document.createElement('input');
      display.type = 'text';
      display.className = 'calc-display';
      display.value = '0';
      display.readOnly = true;
      display.style.width = '100%';
      display.style.fontSize = '24px';
      display.style.textAlign = 'right';
      display.style.padding = '10px';
      display.style.marginBottom = '10px';

      const buttonGrid = document.createElement('div');
      buttonGrid.style.display = 'grid';
      buttonGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      buttonGrid.style.gap = '5px';
      buttonGrid.style.padding = '10px';

      const buttons = [
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', 'C', '=', '+'
      ];

      let currentValue = '0';
      let operator = null;
      let previousValue = null;

      const calculate = () => {
        if (operator && previousValue !== null) {
          const a = parseFloat(previousValue);
          const b = parseFloat(currentValue);
          switch (operator) {
            case '+': currentValue = String(a + b); break;
            case '-': currentValue = String(a - b); break;
            case '*': currentValue = String(a * b); break;
            case '/': currentValue = String(a / b); break;
          }
          display.value = currentValue;
          operator = null;
          previousValue = null;
        }
      };

      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn;
        button.style.fontSize = '18px';
        button.style.padding = '20px';

        button.onclick = () => {
          if (btn >= '0' && btn <= '9') {
            currentValue = currentValue === '0' ? btn : currentValue + btn;
            display.value = currentValue;
          } else if (btn === 'C') {
            currentValue = '0';
            operator = null;
            previousValue = null;
            display.value = '0';
          } else if (btn === '=') {
            calculate();
          } else {
            if (operator) {
              calculate();
            }
            operator = btn;
            previousValue = currentValue;
            currentValue = '0';
          }
        };

        buttonGrid.appendChild(button);
      });

      win.$content.appendChild(display);
      win.$content.appendChild(buttonGrid);

      return win;
    }
  };
};
