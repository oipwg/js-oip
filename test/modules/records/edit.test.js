import { Artifact as Record } from '../../../src/modules/records/artifact'
import EditRecord from '../../../src/modules/records/edit'

describe('RFC6902 Tests', () => {
  test('create RFC6902 Patch', () => {
    let edit = new EditRecord()

    let rfc6902Patch = edit.createRFC6902Patch({ field: "before" }, { field: "after" })

    expect(rfc6902Patch).toEqual([ { op: "replace", path: "/field", value: "after" } ])
  })
})

describe('Squash RFC6902', () => {
  test('squash RFC6902 Patch (single field, single op)', () => {
     let edit = new EditRecord()

    let rfc6902Patch = [ { op: "replace", path: "/field", value: "after" }, { op: "replace", path: "/second", value: "two" } ]

    let squashedPatch = edit.squashRFC6902Patch(rfc6902Patch)

    expect(squashedPatch).toBe({ replace: { "/field": "after" } })
  })
  test('squash RFC6902 Patch (multiple fields, single op)', () => {
     let edit = new EditRecord()

    let rfc6902Patch = [ 
      { op: "replace", path: "/field", value: "after" },
      { op: "replace", path: "/second", value: "two" }
    ]

    let squashedPatch = edit.squashRFC6902Patch(rfc6902Patch)

    expect(squashedPatch).toBe({ replace: { "/field": "after", "/second": "two" } })
  })
  test('squash RFC6902 Patch (single fields, multiple ops)', () => {
     let edit = new EditRecord()

    let rfc6902Patch = [ 
      { op: "remove", path: "/field" },
      { op: "replace", path: "/second", value: "two" }
    ]

    let squashedPatch = edit.squashRFC6902Patch(rfc6902Patch)

    expect(squashedPatch).toBe({ 
      remove: [ "/field" ], 
      replace: { "/second": "two" } 
    })
  })
  test('squash RFC6902 Patch (multiple fields, multiple ops)', () => {
    let edit = new EditRecord()

    let rfc6902Patch = [ 
      { op: "remove", path: "/first" },
      { op: "remove", path: "/second" },
      { op: "replace", path: "/third", value: "three" },
      { op: "replace", path: "/fourth", value: "four" },
      { op: "replace", path: "/fifth", value: "five" },
      { op: "add", path: "/sixth", value: "six" },
      { op: "add", path: "/seventh", value: "seven" },
      { op: "move", from: "/eigth", path: "/newEightLand" },
      { op: "copy", from: "/ninth", path: "/nineTopia" },
      { op: "test", path: "/myField", value: "eightyNine" },
    ]

    let squashedPatch = edit.squashRFC6902Patch(rfc6902Patch)

    expect(squashedPatch).toBe({ 
      remove: [ "/first", "/second" ], 
      replace: { 
        "/third": "three",
        "/fourth": "four",
        "/fifth": "five"
      },
      add: {
        "/sixth": "six",
        "/seventh": "seven"
      },
      move: {
        "/eigth": "/newEightLand"
      },
      copy: {
        "/ninth": "/nineTopia"
      },
      test: {
        "/myField": "eightyNine"
      }
    })
  })
})
describe('Unsquash RFC6902', () => {
  test('unsquash RFC6902 Patch', () => {
    let edit = new EditRecord()

    let squashedPatch = { 
      remove: [ "/first", "/second" ], 
      replace: { 
        "/third": "three",
        "/fourth": "four",
        "/fifth": "five"
      },
      add: {
        "/sixth": "six",
        "/seventh": "seven"
      },
      move: {
        "/eigth": "/newEightLand"
      },
      copy: {
        "/ninth": "/nineTopia"
      },
      test: {
        "/myField": "eightyNine"
      }
    }

    let rfc6902Patch = edit.unsquashRFC6902Patch(squashedPatch)

    expect(rfc6902Patch).toBe([ 
      { op: "remove", path: "/first" },
      { op: "remove", path: "/second" },
      { op: "replace", path: "/third", value: "three" },
      { op: "replace", path: "/fourth", value: "four" },
      { op: "replace", path: "/fifth", value: "five" },
      { op: "add", path: "/sixth", value: "six" },
      { op: "add", path: "/seventh", value: "seven" },
      { op: "move", from: "/eigth", path: "/newEightLand" },
      { op: "copy", from: "/ninth", path: "/nineTopia" },
      { op: "test", path: "/myField", value: "eightyNine" },
    ])
  })
})

describe("Apply Squashed Patch to Record")
  test('apply Squashed Patch', () => {
    let original_record = new Record()

    original_record.setTXID("testTXID")
    original_record.setTitle("original title")

    let squashedPatch = { replace: { "/title": "my new thing" } }

    let edit = new EditRecord(original_record)

    // setPatch should apply the patch to the Original Record if there is no "patched record" defined
    edit.setPatch(squashedPatch)

    let modifed_record = edit.getPatchedRecord()

    expect(modifed_record.getTitle()).toBe("my new thing")
  })
})

describe('Create Squashed Patch from Records', () => {
  test('Create Patch (simple Record)', () => {
    let original_record = new Record()

    original_record.setTXID("testTXID")
    original_record.setTitle("original title")

    let modified_record = new Record()
    modifed_record.fromJSON(original_record.toJSON())

    modifed_record.setTitle("my new thing")

    let edit = new EditRecord(original_record, modifed_record)

    console.log(edit.getPatch())
    
    expect(edit.getPatch()).toEqual({ replace: { "/title": "my new thing" } })
  })
})
