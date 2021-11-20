import { ObservableProp, updateOn } from '../ObservableClass.js'

describe('updateOn()', () => {
    it('should generate change', async () => {
        const prop = new ObservableProp()
        const arr = []
        
        setTimeout(() => {
            prop.set('hello')
            prop.set('there')
        })

        for await (const newVal of updateOn(prop)) {
            arr.push(newVal)

            if (arr.length === 2) break
        }

        expect(arr).to.deep.equal(['hello', 'there'])
    })
})