export const templateLibrary = [
  {
    id: "valentines",
    title: "Valentine's Day",
    description: "A romantic template perfect for Valentine's Day",
    thumbnail: "/valentines-template.png",
    settings: {
      backgroundColor: "#fff5f7",
      textColor: "#4a1c24",
      fontFamily: "Dancing Script",
    },
    components: [
      {
        id: "header-1",
        type: "header",
        data: {
          title: "Happy Valentine's Day",
          subtitle: "A special message just for you",
          align: "center",
          showDivider: true,
        },
      },
      {
        id: "hero-1",
        type: "hero",
        data: {
          title: "To My Valentine",
          subtitle: "With all my love",
          backgroundImage: "/placeholder.svg?height=600&width=1200&query=romantic roses and hearts",
          buttonText: "Read My Message",
          buttonUrl: "#message",
          overlay: true,
          height: 60,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 0,
          textAlign: "center",
        },
      },
      {
        id: "quote-1",
        type: "quote",
        data: {
          text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
          author: "Maya Angelou",
          align: "center",
          style: "modern",
        },
      },
      {
        id: "gallery-1",
        type: "gallery",
        data: {
          title: "Our Moments Together",
          images: [
            {
              src: "/placeholder.svg?height=400&width=600&query=romantic couple dinner",
              alt: "Romantic dinner",
              caption: "Our anniversary dinner",
            },
            {
              src: "/placeholder.svg?height=400&width=600&query=couple walking beach sunset",
              alt: "Beach walk",
              caption: "Sunset at the beach",
            },
            {
              src: "/placeholder.svg?height=400&width=600&query=couple laughing park",
              alt: "Park day",
              caption: "That day at the park",
            },
          ],
          columns: 3,
          gap: "medium",
        },
      },
      {
        id: "message-1",
        type: "message",
        data: {
          title: "My Valentine's Message",
          message:
            "Every day with you is a wonderful addition to my life's journey. Thank you for being my partner, my confidant, and my best friend. I love you more than words can express.",
          signature: "Forever yours",
          style: "card",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        data: {
          text: "Made with ❤️ for you",
          showSocialLinks: false,
          socialLinks: [],
        },
      },
    ],
  },
  {
    id: "mothers-day",
    title: "Mother's Day",
    description: "A heartfelt template to celebrate mom",
    thumbnail: "/placeholder.svg?height=400&width=600&query=mother's day template with flowers",
    settings: {
      backgroundColor: "#f8f5ff",
      textColor: "#2e1065",
      fontFamily: "Montserrat",
    },
    components: [
      {
        id: "header-1",
        type: "header",
        data: {
          title: "Happy Mother's Day",
          subtitle: "To the world's best mom",
          align: "center",
          showDivider: true,
        },
      },
      {
        id: "hero-1",
        type: "hero",
        data: {
          title: "For My Amazing Mom",
          subtitle: "Thank you for everything",
          backgroundImage: "/placeholder.svg?height=600&width=1200&query=mother and child with flowers",
          buttonText: "See My Tribute",
          buttonUrl: "#message",
          overlay: true,
          height: 60,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 0,
          textAlign: "center",
        },
      },
      {
        id: "quote-1",
        type: "quote",
        data: {
          text: "A mother's arms are more comforting than anyone else's.",
          author: "Princess Diana",
          align: "center",
          style: "modern",
        },
      },
      {
        id: "gallery-1",
        type: "gallery",
        data: {
          title: "Memories With Mom",
          images: [
            {
              src: "/placeholder.svg?height=400&width=600&query=mother and child cooking",
              alt: "Cooking together",
              caption: "Baking cookies together",
            },
            {
              src: "/placeholder.svg?height=400&width=600&query=mother and child garden",
              alt: "Gardening",
              caption: "Working in the garden",
            },
            {
              src: "/placeholder.svg?height=400&width=600&query=mother and child vacation",
              alt: "Vacation",
              caption: "Our trip to the beach",
            },
          ],
          columns: 3,
          gap: "medium",
        },
      },
      {
        id: "message-1",
        type: "message",
        data: {
          title: "Dear Mom",
          message:
            "Thank you for your endless love, patience, and support. You've always been there for me, through thick and thin. I'm so grateful to have you as my mother. I love you more than words can say.",
          signature: "Your loving child",
          style: "card",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        data: {
          text: "Created with love for Mom",
          showSocialLinks: false,
          socialLinks: [],
        },
      },
    ],
  },
  {
    id: "birthday",
    title: "Birthday Celebration",
    description: "A fun template to celebrate birthdays",
    thumbnail: "/placeholder.svg?height=400&width=600&query=birthday celebration with cake and balloons",
    settings: {
      backgroundColor: "#f0f9ff",
      textColor: "#0c4a6e",
      fontFamily: "Poppins",
    },
    components: [
      {
        id: "header-1",
        type: "header",
        data: {
          title: "Happy Birthday!",
          subtitle: "Let's celebrate your special day",
          align: "center",
          showDivider: true,
        },
      },
      {
        id: "hero-1",
        type: "hero",
        data: {
          title: "It's Your Day!",
          subtitle: "Wishing you the happiest birthday ever",
          backgroundImage: "/placeholder.svg?height=600&width=1200&query=birthday cake with candles and balloons",
          buttonText: "See Your Surprise",
          buttonUrl: "#message",
          overlay: true,
        },
      },
      {
        id: "countdown-1",
        type: "countdown",
        data: {
          title: "Countdown to your birthday party!",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          showLabels: true,
          style: "cards",
        },
      },
      {
        id: "gallery-1",
        type: "gallery",
        data: {
          title: "Birthday Memories",
          images: [
            {
              src: "/placeholder.svg?height=400&width=600&query=birthday party with friends",
              alt: "Party",
              caption: "Last year's celebration",
            },
            {
              src: "/placeholder.svg?height=400&width=600&query=birthday cake with candles",
              alt: "Cake",
              caption: "Your favorite cake",
            },
            {
              src: "/placeholder.svg?height=400&width=600&query=opening birthday presents",
              alt: "Presents",
              caption: "Opening gifts",
            },
          ],
          columns: 3,
          gap: "medium",
        },
      },
      {
        id: "message-1",
        type: "message",
        data: {
          title: "Birthday Wishes",
          message:
            "On your special day, I want you to know how much you mean to me. May your birthday be filled with laughter, love, and all the things that bring you joy. Here's to another amazing year!",
          signature: "With love and best wishes",
          style: "card",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        data: {
          text: "Created for your birthday celebration",
          showSocialLinks: false,
          socialLinks: [],
        },
      },
    ],
  },
  {
    id: "wedding",
    title: "Wedding Announcement",
    description: "An elegant template for wedding announcements",
    thumbnail: "/placeholder.svg?height=400&width=600&query=elegant wedding template with rings",
    settings: {
      backgroundColor: "#fffbf5",
      textColor: "#44403c",
      fontFamily: "Playfair Display",
    },
    components: [
      {
        id: "header-1",
        type: "header",
        data: {
          title: "We're Getting Married",
          subtitle: "Join us for our special day",
          align: "center",
          showDivider: true,
        },
      },
      {
        id: "hero-1",
        type: "hero",
        data: {
          title: "Save the Date",
          subtitle: "We request the pleasure of your company",
          backgroundImage: "/placeholder.svg?height=600&width=1200&query=elegant wedding scene with flowers",
          buttonText: "RSVP",
          buttonUrl: "#message",
          overlay: true,
        },
      },
      {
        id: "countdown-1",
        type: "countdown",
        data: {
          title: "Counting down to our wedding day",
          date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
          showLabels: true,
          style: "cards",
        },
      },
      {
        id: "timeline-1",
        type: "timeline",
        data: {
          title: "Our Love Story",
          events: [
            {
              date: "June 15, 2019",
              title: "First Met",
              description: "We met at a friend's party",
              type: "event",
            },
            {
              date: "December 24, 2020",
              title: "Engagement",
              description: "The proposal during Christmas Eve",
              type: "milestone",
            },
            {
              date: "September 15, 2023",
              title: "Wedding Day",
              description: "The day we say 'I do'",
              type: "milestone",
            },
          ],
          style: "vertical",
          theme: "romantic",
        },
      },
      {
        id: "message-1",
        type: "message",
        data: {
          title: "Wedding Details",
          message:
            "We are excited to celebrate our special day with you. The ceremony will be held at St. Mary's Church at 2:00 PM, followed by a reception at The Grand Hotel. Please RSVP by August 15.",
          signature: "With love, [Couple Names]",
          style: "card",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        data: {
          text: "We can't wait to celebrate with you",
          showSocialLinks: false,
          socialLinks: [],
        },
      },
    ],
  },
  {
    id: "graduation",
    title: "Graduation Celebration",
    description: "A template to celebrate academic achievements",
    thumbnail: "/placeholder.svg?height=400&width=600&query=graduation celebration with cap and diploma",
    settings: {
      backgroundColor: "#f0fdf4",
      textColor: "#166534",
      fontFamily: "Roboto",
    },
    components: [
      {
        id: "header-1",
        type: "header",
        data: {
          title: "Graduation Announcement",
          subtitle: "Celebrating academic success",
          align: "center",
          showDivider: true,
        },
      },
      {
        id: "hero-1",
        type: "hero",
        data: {
          title: "I Did It!",
          subtitle: "Class of 2023",
          backgroundImage: "/placeholder.svg?height=600&width=1200&query=graduation ceremony with cap toss",
          buttonText: "See My Journey",
          buttonUrl: "#timeline",
          overlay: true,
          height: 60,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 0,
          textAlign: "center",
        },
      },
      {
        id: "quote-1",
        type: "quote",
        data: {
          text: "Education is the most powerful weapon which you can use to change the world.",
          author: "Nelson Mandela",
          align: "center",
          style: "modern",
        },
      },
      {
        id: "timeline-1",
        type: "timeline",
        data: {
          title: "My Academic Journey",
          events: [
            {
              date: "September 2019",
              title: "First Day",
              description: "Beginning my academic journey",
              type: "milestone",
            },
            {
              date: "May 2021",
              title: "Halfway There",
              description: "Completing my second year with honors",
              type: "achievement",
            },
            {
              date: "June 2023",
              title: "Graduation",
              description: "Receiving my diploma with distinction",
              type: "achievement",
            },
          ],
          style: "vertical",
          theme: "professional",
        },
      },
      {
        id: "message-1",
        type: "message",
        data: {
          title: "Thank You",
          message:
            "I want to express my gratitude to everyone who supported me throughout my academic journey. Your encouragement and belief in me made all the difference. I couldn't have done it without you!",
          signature: "With appreciation, [Your Name]",
          style: "card",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        data: {
          text: "Celebrating educational achievement",
          showSocialLinks: false,
          socialLinks: [],
        },
      },
    ],
  },
];
