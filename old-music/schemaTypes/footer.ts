import {defineField, defineType} from 'sanity'


export default defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'url1',
      title: 'url1',
      type: 'url',
    }),
    defineField({
      name: 'url2',
      title: 'url2',
      type: 'url',
    }),
    defineField({
      name: 'url3',
      title: 'url3',
      type: 'url',
    }),
    defineField({
      name: 'url4',
      title: 'url4',
      type: 'url',
    }),
    defineField({
      name: 'url5',
      title: 'url5',
      type: 'url',
    }),
    defineField({
      name: 'url6',
      title: 'url6',
      type: 'url',
    }),
    defineField({
      name: 'url7',
      title: 'url7',
      type: 'url',
    }),
    defineField({
      name: 'url8',
      title: 'url8',
      type: 'url',
    }),
    defineField({
      name: 'url9',
      title: 'url9',
      type: 'url',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright',
      type: 'string',
    }),
  ],
})