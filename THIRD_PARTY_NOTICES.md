# Third-party notices

This site stays vanilla HTML, CSS, and JavaScript. The pieces below are used under their published licenses. No React Bits code is included.

## MiniSearch

Search is powered by [MiniSearch](https://github.com/lucaong/minisearch) 7.2.0. The file in this repo is the unmodified ESM build from the official npm package, copied from `dist/es/index.js` (no local minify or bundle step). It is stored at `js/vendor/minisearch-7.2.0/dist/es/index.js`.

- Package version: 7.2.0
- Path within the package: `dist/es/index.js`
- Registry tarball: `https://registry.npmjs.org/minisearch/-/minisearch-7.2.0.tgz`
- npm package integrity: `sha512-dqT2XBYUOZOiC5t2HRnwADjhNS2cecp9u+TJRiJ1Qp/f5qjkeT5APcGPjHw+bz89Ms8Jp+cG4AlE+QZ/QnDglg==`
- SHA-256 of `dist/es/index.js`: `0393b3ba253b809d5e55707c7b0875ef9b518a296a006c6739b28876e154edb3`
- npm integrity of that file: `sha512-zPR9a62LVHjPR4UkDRjWeHnRy93dnjdMCeufRmQYygsqxZzlm/OVLwaw0M2+7CvXqxoz0QOW/J2/stss5kLjtw==`

```
MIT License

Copyright 2022 Luca Ongaro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Magic UI

The reading-progress bar, the scramble-on-reveal headings, and the scroll-reveal fade are vanilla ports of Magic UI components (Scroll Progress, Hyper Text, and Blur Fade). They are not React components. Magic UI is MIT.

```
MIT License

Copyright (c) Magic UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

https://magicui.design/docs/components/scroll-progress
https://magicui.design/docs/components/hyper-text
https://magicui.design/docs/components/blur-fade

## Uiverse

The Personal-page video skeletons and the back-to-top button are adapted from Uiverse.io components published under the MIT License.

- Skeleton cards: young-wolverine-83 by Deri-Kurniawan. The page keeps the comment `From Uiverse.io by Deri-Kurniawan`.
- Back-to-top button: afraid-falcon-17 by vinodjangid07. The button keeps the comment `From Uiverse.io by vinodjangid07`.

```
MIT License

Copyright (c) Uiverse authors (Deri-Kurniawan; vinodjangid07)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Gallery lightbox

The Photography lightbox interaction (native dialog, previous/next, counter, captions) is inspired by the 21st.dev gallery-4 pattern, published MIT-0. The implementation here is original vanilla JavaScript and does not copy that component's source.
