// @ts-check
function mutelistBookmarklet() {
  /**
   * @param {TagName} tagName
   * @param {(
   *  Omit<Partial<HTMLElement['style']> & Partial<HTMLElementTagNameMap[TagName]>, 'children' | 'parent' | 'parentElement' | 'style'> &
   *  {
   *    children?: (Element | string | null | void | undefined)[] | Element | string | null | void | undefined,
   *    parent?: Element | null, 
   *    parentElement?: Element | null,
   *    style?: string | Partial<HTMLElement['style']>
   *  })=} [style]
   * @returns {HTMLElementTagNameMap[TagName]}
   * @template {string} TagName
   */
  function elem(tagName, style) {
    var el = document.createElement(tagName);

    if (style && typeof /** @type {*} */(style).appendChild === 'function') {
      var tmp = parent;
      style = /** @type {*} */(parent);
      parent = tmp;
    }

    if (typeof style === 'string') {
      if (/** @type{*} */(style).indexOf(':') >= 0) el.style.cssText = style;
      else el.className = style;
    }
    else if (style) {
      /** @type {Element | undefined} */
      var setParent;
      /** @type {Element[] | undefined} */
      var appendChildren;
      for (var key in style) {
        if (key === 'parent' || key === 'parentElement') {
          setParent = /** @type {*} */(style[key]);
          continue;
        }
        else if (key === 'children') {
          appendChildren = /** @type {*} */(style[key]);
          continue;
        }
        else if (style[key] == null || (typeof style[key] === 'function' && !(key in el))) continue;

        if (key in el) el[key] = style[key];
        else if (key in el.style) el.style[key] = /** @type {*} */(style[key]);
      }

      if (appendChildren) {
        for (const child of Array.isArray(appendChildren) || /** @type {*} */(appendChildren).length > 0 ? appendChildren : [appendChildren]) {
          if (child == null) continue;
          if (typeof child === 'string') {
            const childText = document.createTextNode(child);
            el.appendChild(childText);
          } else {
            el.appendChild(child);
          }
        }
      }

      if (setParent && typeof setParent.appendChild === 'function') setParent.appendChild(el);
    }

    return /** @type {*} */(el);
  }

  async function showPanelAndLoad() {
    if (!/bsky\.app$/i.test(location.host))
      return confirm('Function only available on bsky.app, redirect there?') && location.replace('https://bsky.app');

    var refreshJwt, accessJwt;
    try {
      refreshJwt = JSON.parse(localStorage.getItem('root')).session.accounts[0].refreshJwt;
    } catch (error) { }
    
    if (!refreshJwt)
      return alert('Login information is not available, potentially BlueSky app was significantly updated, or used logged out.');

    if (window.mutelistPanelBookmarklet?.parentElement) window.mutelistPanelBookmarklet.parentElement.removeChild(window.mutelistPanelBookmarklet);
    var panel, closeButton;
    window.mutelistPanelBookmarklet = elem('div', {
      parent: document.body,
      style: `position: fixed; right:0;top:0; width:85%; height: 85%; padding: 1em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol","Arial Unicode";`,
      children: [
        closeButton = elem('button', {
          innerHTML: ' &times; ',
          style: 'position: absolute; right: 1em; top: 1em; border-width: 0; border-radius: 200%; box-shadow: 1px 2px 6px #00000057; transform: scale(1.7); cursor: pointer;',
          onclick: () => {
            window.mutelistPanelBookmarklet.parentElement?.removeChild(window.mutelistPanelBookmarklet);
          }
        }),
        panel = elem('div', {
          style: `width: 100%; height: 100%; background: white; color: black; border: solid 1px silver; overflow: auto;`,
          textContent: 'Loading mutelists...'
        })
      ]
    });

    panel.textContent = '';

    let cursor = '';
    const loadedMutelists = [];
    while (true) {
      const loadingMoreLabel = elem('div', {
        textContent:
          (!loadedMutelists.length ? '...' : loadedMutelists.length + ' loaded, ') +
          'requesting from BlueSky API...', parent: panel
      });
      try {
        if (!accessJwt) {
          const reply = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('root')).session.accounts[0].refreshJwt }
          }).then(x => x.json());
          accessJwt = reply.accessJwt;
        }

        const moreData = await fetch('https://bsky.social/xrpc/app.bsky.graph.getListMutes?cursor=' + cursor, {
          headers: { Authorization: 'Bearer ' + accessJwt } }).then(x => x.json());

        for (const muteList of moreData.lists) {
          loadedMutelists.push(muteList);
          var listElem = elem('div');
          panel.appendChild(listElem);
          renderMuteList(listElem, muteList);
        }

        panel.removeChild(loadingMoreLabel);

        if (moreData.cursor) cursor = moreData.cursor;
        else break;
      } catch (error) {
        const retryAt = Date.now() + 2000 + Math.random() * 3000;
        while (Date.now() < retryAt) {
          loadingMoreLabel.textContent = error.message + ' loading from server, retry in' + Math.round((retryAt - Date.now()) / 1000) + 's...';
          await new Promise(resolve => setTimeout(resolve, Math.min(500, retryAt - Date.now())));
        }
        panel.removeChild(loadingMoreLabel);
      }
    }

    async function renderMuteList(listElem, muteList) {
      const title = elem('div', {
        parent: listElem,
        textContent: muteList.name,
        style: 'font-weight: bold',
        children: muteList.avatar && elem('img', {
          src: muteList.avatar,
          style: `width: 2em; height: 2em; border-radius: 200%; float:left; margin-right: 0.25em;`
        })
      });
      const members = elem('div', {
        parent: listElem,
        textContent: '(fetching...)',
        style: 'clear: both; padding-left: 2em;'
      });

      var listCursor = '';
      while (true) {


      }

    }

    async function renderList(parent, getNext, renderElement, renderProgress) {
      var cursor = '';
      var loadedEntries = [];
      var loadedElements = [];

      while (true) {
        var progressElem = renderProgress(loadedEntries);
        parent.appendChild(progressElem);

        let nextChunk;
        try { nextChunk = await getNext(cursor); }
        catch (getError) {
          parent.removeChild(progressElem);
          // 
        }
      }

    }
  }

  showPanelAndLoad();
} mutelistBookmarklet();
