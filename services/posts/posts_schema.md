# Content posting system

## No post without content
        file(img(collage),gif,video || link(embed,file,page) || poll
## post form:
        user,visibility,adds(commentable,archive)
        attach panel(file(img or video),link,poll)
            - if link content||file video||gif ||poll -> dissmiss attach panel
            - if file imgs -> stay attach panel file image
            - file(imgs, gif, video up to 10MB):
                - img(jpg,png,gif): load -> ?canvas thumb
                  -> req,files -> to jpg, make thumb,storage -> db
                - gif(gif): load -> ?canvas thumb -> req,files -> make jpg thumb,storage -> db
                - video(mp4,webm): load -> req,files -> decode to mp4,make jpg thumb,storage -> db
            - link content(embed,file,page):
                - embed(yt,vm,fb): add link -> embedza(embed, title and thumb)
                  -> thumb,title;type,link,src -> req -> db
                - file(pdf, mp4...): add link -> (if img -> ?canvas thumb)
                  -> link,src;type,thumb,title -> req -> db
                - page: add link -> metafetch -> thumb,title,src;type,link -> req -> db
                file check if thumb -> component1 else(embed,page by src) -> component2(file)
            - poll: subject, ends_at, options{option,img} -> req -> db
            - ???streams 'application/octet-stream'
        description
            if has link -> create link content
        tags
## req:
        - req.body:
            - type: ['file', 'link', 'poll']
            - commentable
            - archived
            - communityId
            - description
            - tags
            -----------------------------------------------
            - fileType(img|gif|video)
            - linkType(embed|file|page),linkUrl,linkThumb,linkSrc,linkTitle
            - pollSubject, pollEndsAt, pollOptions{option_0: ''}
        - ?files
## db
        *posts:
        |--------------|--------------------------|
        | slug         |                          |
        | author_id    |                          |
        | type:        | ['file', 'link', 'poll'] |
        | commentable  | bool                     |
        | archived     | bool                     |
        | community_id |                          |
        | description  |                          |

        *post_files
        |-------------|-----------------------------------------|
        | post_id     |                                         |
        | mime        | ['image/jpg', 'image/gif', 'video/mp4'] |
        | file        | storage                                 |
        | thumb       | storage                                 |

        *post_links
        |-------------|---------------------------|
        | post_id     |                           |
        | type        | ['embed', 'file', 'page'] |
        | link        | remote                    |
        | src         | scr                       |
        | thumb       | storage(e,?f,p)           |
        | title       | title(e,?f,p)             |

        *post_polls
        | post_polls: | post_polls_options | post_polls_voices |
        |-------------|--------------------|-------------------|
        | post_id     | poll_id            | option_id         |
        | subject     | option             | user_id           |
        | ?ends_at    | ?img               |                   |