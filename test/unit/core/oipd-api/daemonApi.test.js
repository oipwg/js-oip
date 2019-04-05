import { DaemonApi } from '../../../../src/core'

let index = new DaemonApi()

describe('DaemonApi', () => {
  it('createQs 1 | createQs()', async () => {
    let args = [
      { field: 'artifact.type', query: 'research' },
      { operator: 'OR' },
      { field: 'artifact.type', query: 'music' },
      { operator: 'wrap', type: 'all' },
      { operator: 'AND' },
      { field: 'artifact.info.year', query: '2017' }
    ]

    let qs = index.createQs(args)
    expect(qs).toEqual(`(artifact.type:"research" OR artifact.type:"music") AND artifact.info.year:"2017"`)
  })

  it('createQs 2 | createQs()', async () => {
    let args = [
      { operator: 'wrap', type: 'start' },
      { field: 'artifact.details.defocus', query: '-10' },
      { operator: 'AND' },
      { field: 'artifact.details.microscopist', query: 'Yiwei Chang' },
      { operator: 'wrap', type: 'end' },
      { operator: 'OR' },
      { operator: 'wrap', type: 'start' },
      { field: 'artifact.details.defocus', query: '-8' },
      { operator: 'AND' },
      { field: 'artifact.details.microscopist', query: 'Ariane Briegel' },
      { operator: 'wrap', type: 'end' }
    ]

    let qs = index.createQs(args)
    expect(qs).toEqual(`( artifact.details.defocus:"-10" AND artifact.details.microscopist:"Yiwei Chang" ) OR ( artifact.details.defocus:"-8" AND artifact.details.microscopist:"Ariane Briegel" )`)
  })
  it('createQs 3 | createQs()', async () => {
    let args = [
      { field: 'artifact.info.description', query: 'ryan' },
      { query: 'eric' },
      { query: 'bits' }
    ]

    let qs = index.createQs(args)
    expect(qs).toEqual(`artifact.info.description:"ryan" eric bits`)
  })
  it('createQs 4 | createQs()', async () => {
    let searchQuery = [
      { operator: 'wrap', type: 'start' },
      { field: 'artifact.type', query: 'research' },
      { operator: 'AND' },
      { field: 'artifact.info.year', query: '2017' },
      { operator: 'wrap', type: 'end' }, { operator: 'OR' },
      { operator: 'wrap', type: 'start' },
      { field: 'artifact.info.year', query: '2016' },
      { operator: 'AND' },
      { field: 'artifact.type', query: 'music' },
      { operator: 'wrap', type: 'end' }]
    let qs = index.createQs(searchQuery)
    // console.log(qs)
    expect(qs).toEqual(`( artifact.type:"research" AND artifact.info.year:"2017" ) OR ( artifact.info.year:"2016" AND artifact.type:"music" )`)
  })
})
