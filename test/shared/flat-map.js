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

import { Iterator, flatMap, flatten, map } from '../../src/index.js'
import { getFnArb, getIterableArb, testReturnsIterable } from '../helpers.js'
import { testProp } from 'ava-fast-check'
import test from 'ava'

const iterableArb = getIterableArb()
const flatMapArbs = [getFnArb({ valueArb: iterableArb }), iterableArb]

testReturnsIterable(flatMap, flatMapArbs)

testProp(`flatMap flat maps`, flatMapArbs, (t, fn, iterable) => {
  t.deepEqual(
    [...flatMap(fn, iterable)],
    [...iterable].flatMap(value => [...fn(value)])
  )
})

testProp(`flatMap is lazy`, flatMapArbs, (t, fn, iterable) => {
  let count = 0
  const iterator = Iterator.fromIterable(
    flatMap(
      value =>
        map(innerValue => {
          count++
          return innerValue
        }, fn(value)),
      iterable
    )
  )
  t.is(count, 0)

  let i = 0
  while (iterator.hasNext()) {
    iterator.getNext()
    t.is(count, i + 1)
    i++
  }
})

test(`flatMap concrete example`, t => {
  const values = [1, 2, 3, 4, 5]

  const mapped = [...flatMap(value => [value / 2, value, value * 2], values)]

  t.deepEqual(mapped, [0.5, 1, 2, 1, 2, 4, 1.5, 3, 6, 2, 4, 8, 2.5, 5, 10])
})

const nestedIterablesArb = getIterableArb({ valueArb: iterableArb })

testProp(`flatten flattens`, [nestedIterablesArb], (t, iterable) => {
  t.deepEqual(
    [...flatten(iterable)],
    [...iterable].map(subiterable => [...subiterable]).flat()
  )
})

testProp(`flatten is lazy`, [nestedIterablesArb], (t, iterable) => {
  let count = 0
  iterable = map(
    subiterable =>
      map(value => {
        count++
        return value
      }, subiterable),
    iterable
  )

  flatten(iterable)

  t.is(count, 0)
})

test(`flatten concrete example`, t => {
  const values = [[1, 2], [3, 4, 5], [], [6, 7, 8]]

  const flattened = [...flatten(values)]

  t.deepEqual(flattened, [1, 2, 3, 4, 5, 6, 7, 8])
})
