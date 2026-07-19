# Third-Party Licenses

## Cube-solving algorithm

The `:solver` module's two-phase Rubik's Cube solving algorithm
(`CubeModel.kt`, `Moves.kt`, `PermutationCoord.kt`, `TwoPhaseSolver.kt`) is a Kotlin port of
[**cube.js**](https://github.com/ldez/cubejs) by Petri Lehtinen and Ludovic Fernandez — the
same library the CubeSolver AI web app already depends on (`cubejs` on npm). It implements
Herbert Kociemba's two-phase algorithm.

```
Copyright (c) 2013-2017 Petri Lehtinen <petri@digip.org>
Copyright (c) 2018 Ludovic Fernandez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

Note on an alternative considered: `cs0x7f/min2phase` (a Java implementation of the same
algorithm) was initially considered for vendoring, but was rejected — its README claims a
dual GPLv3/MIT license, but its core `Search.java` file's own header cites only GPLv3, an
unresolved inconsistency that's a real risk for a closed-source app. The cube.js port above
has an unambiguous, single MIT license and was already an accepted dependency of this
project's web app, so it carries no new licensing risk.

## Everything else

All other dependencies (AndroidX/Jetpack libraries, Kotlin/kotlinx-coroutines, CameraX,
Google Mobile Ads Next-Gen SDK, User Messaging Platform SDK) are used as unmodified binary
dependencies via Gradle under their own standard licenses (Apache 2.0 for AndroidX/Kotlin;
Google's own SDK license terms for the ads/UMP SDKs) and are not redistributed as source in
this repository.
