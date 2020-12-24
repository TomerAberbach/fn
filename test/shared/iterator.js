/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AsyncIterator, Iterator } from '../../src/shared/iterator.js'
import { getAsyncIterableArb, getIterableArb } from '../helpers.js'
import { testProp } from 'ava-fast-check'

testProp(
  `Iterator iterates like a native iterator`,
  [getIterableArb()],
  (t, iterable) => {
    const iterator = Iterator.fromIterable(iterable)
    const nativeIterator = iterable[Symbol.iterator]()

    while (iterator.hasNext()) {
      const value = iterator.getNext()
      const result = nativeIterator.next()

      t.false(result.done)
      t.is(value, result.value)
    }

    t.false(iterator.hasNext())
    t.true(nativeIterator.next().done)
  }
)

testProp(
  `AsyncIterator iterates like a native async iterator`,
  [getAsyncIterableArb()],
  async (t, iterable) => {
    const asyncIterator = AsyncIterator.fromIterable(iterable)
    const nativeAsyncIterator = iterable[Symbol.asyncIterator]()

    while (await asyncIterator.hasNext()) {
      const value = await asyncIterator.getNext()
      const result = await nativeAsyncIterator.next()

      t.false(result.done)
      t.is(value, result.value)
    }

    t.false(await asyncIterator.hasNext())
    t.true((await nativeAsyncIterator.next()).done)
  }
)
