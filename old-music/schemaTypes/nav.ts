import {defineField, defineType} from 'sanity'


export default defineType({
  name: 'nav',
  title: 'Nav',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'imageL',
      title: 'ImageL',
      type: 'image',
    }),
    defineField({
      name: 'imageR',
      title: 'ImageR',
      type: 'image',
    }),
    defineField({
      name: 'weburl',
      title: 'webUrl',
      type: 'url',
    }),
  ],
})