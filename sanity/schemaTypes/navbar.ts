import {defineField, defineType} from "sanity"

export default defineType({
  name: 'navbar',
  title: 'NavBar',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
})