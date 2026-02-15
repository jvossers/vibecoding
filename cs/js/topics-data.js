/**
 * OCR J277 GCSE Computer Science — Full Syllabus Data
 * Used by nav.js for the landing-page topic browser and simulation-page breadcrumbs.
 */
window.TopicsData = [
  // ── Paper 1: Computer Systems ──────────────────────────────────────
  {
    ref: '1.1', title: 'Systems Architecture', paper: 1,
    topics: [
      {
        ref: '1.1.1', title: 'Architecture of the CPU',
        subtopics: [
          'Fetch-Decode-Execute cycle', 'ALU', 'Control Unit', 'Cache',
          'Registers (PC, MAR, MDR, CIR, ACC)', 'Von Neumann architecture'
        ],
        simulations: [{ slug: 'fetch-execute', name: 'Fetch-Execute Cycle Simulator' }]
      },
      {
        ref: '1.1.2', title: 'CPU Performance',
        subtopics: ['Clock speed', 'Cache size', 'Core count'],
        simulations: [{ slug: 'cpu-performance', name: 'CPU Performance Simulator' }]
      },
      {
        ref: '1.1.3', title: 'Embedded Systems',
        subtopics: ['Definition', 'Examples', 'vs general-purpose systems'],
        simulations: []
      }
    ]
  },
  {
    ref: '1.2', title: 'Memory and Storage', paper: 1,
    topics: [
      {
        ref: '1.2.1', title: 'Primary Storage',
        subtopics: ['RAM', 'ROM', 'Virtual memory', 'Cache'],
        simulations: []
      },
      {
        ref: '1.2.2', title: 'Secondary Storage',
        subtopics: ['HDDs', 'SSDs', 'USB', 'Optical storage'],
        simulations: [{ slug: 'secondary-storage', name: 'Secondary Storage Comparator' }]
      },
      {
        ref: '1.2.3', title: 'Units',
        subtopics: ['Bit through terabyte', 'File size calculations'],
        simulations: [{ slug: 'file-size-calculator', name: 'File Size Calculator' }]
      },
      {
        ref: '1.2.4', title: 'Data Storage',
        subtopics: [
          'Binary/denary/hex conversions', 'Binary addition & shifts',
          'ASCII/Unicode', 'Image representation (colour depth, resolution)',
          'Sound (sample rate, bit depth)'
        ],
        simulations: [
          { slug: 'binary-converter', name: 'Binary / Denary / Hex Converter' },
          { slug: 'binary-arithmetic', name: 'Binary Arithmetic Visualiser' },
          { slug: 'image-representation', name: 'Image Representation Explorer' },
          { slug: 'ascii-unicode', name: 'ASCII / Unicode Explorer' },
          { slug: 'sound-representation', name: 'Sound Representation Explorer' }
        ]
      },
      {
        ref: '1.2.5', title: 'Compression',
        subtopics: ['Lossy vs lossless compression techniques'],
        simulations: [{ slug: 'compression', name: 'Compression Demonstrator' }]
      }
    ]
  },
  {
    ref: '1.3', title: 'Networks, Connections and Protocols', paper: 1,
    topics: [
      {
        ref: '1.3.1', title: 'Networks and Topologies',
        subtopics: [
          'Star, mesh topologies', 'Routers, switches, WAPs',
          'Packet switching', 'DNS'
        ],
        simulations: [{ slug: 'network-topology', name: 'Network Topology Builder' }]
      },
      {
        ref: '1.3.2', title: 'Wired/Wireless, Protocols and Layers',
        subtopics: [
          'IPv4/IPv6', 'MAC addresses', 'Encryption',
          'TCP/IP, HTTP/S, FTP, POP, IMAP, SMTP', 'Protocol layers'
        ],
        simulations: [{ slug: 'packet-switching', name: 'Packet Switching Simulator' }]
      }
    ]
  },
  {
    ref: '1.4', title: 'Network Security', paper: 1,
    topics: [
      {
        ref: '1.4.1', title: 'Threats to Computer Systems',
        subtopics: [
          'Malware (viruses, worms, trojans, spyware, ransomware)',
          'Social engineering', 'Phishing', 'Brute-force',
          'DoS/DDoS', 'SQL injection'
        ],
        simulations: []
      },
      {
        ref: '1.4.2', title: 'Preventing Vulnerabilities',
        subtopics: [
          'Penetration testing', 'Anti-malware', 'Firewalls',
          'Access levels', 'Passwords', 'Encryption', 'Physical security'
        ],
        simulations: [{ slug: 'cipher-encryption', name: 'Cipher & Encryption Tool' }]
      }
    ]
  },
  {
    ref: '1.5', title: 'Systems Software', paper: 1,
    topics: [
      {
        ref: '1.5.1', title: 'Operating Systems',
        subtopics: [
          'GUI/CLI', 'Multitasking', 'Memory management',
          'Drivers', 'User/file management'
        ],
        simulations: [{ slug: 'memory-management', name: 'Memory Management Visualiser' }]
      },
      {
        ref: '1.5.2', title: 'Utility Software',
        subtopics: ['Encryption', 'Defragmentation', 'Compression', 'Backup'],
        simulations: [{ slug: 'defragmentation', name: 'Defragmentation Visualiser' }]
      }
    ]
  },
  {
    ref: '1.6', title: 'Impacts of Digital Technology', paper: 1,
    topics: [
      {
        ref: '1.6.1', title: 'Ethical, Legal, Cultural and Environmental',
        subtopics: [
          'Privacy', 'Data Protection Act 2018', 'Computer Misuse Act 1990',
          'Copyright Act 1988', 'Open-source vs proprietary'
        ],
        simulations: []
      }
    ]
  },

  // ── Paper 2: Computational Thinking, Algorithms and Programming ────
  {
    ref: '2.1', title: 'Algorithms', paper: 2,
    topics: [
      {
        ref: '2.1.1', title: 'Computational Thinking',
        subtopics: ['Abstraction', 'Decomposition', 'Algorithmic thinking'],
        simulations: []
      },
      {
        ref: '2.1.2', title: 'Designing Algorithms',
        subtopics: ['Flowcharts', 'Pseudocode', 'Trace tables', 'Logic errors'],
        simulations: [{ slug: 'trace-table', name: 'Trace Table Stepper' }]
      },
      {
        ref: '2.1.3', title: 'Searching and Sorting',
        subtopics: [
          'Linear search', 'Binary search',
          'Bubble sort', 'Merge sort', 'Insertion sort'
        ],
        simulations: [
          { slug: 'sorting-algorithms', name: 'Sorting Algorithm Visualiser' },
          { slug: 'searching-algorithms', name: 'Searching Algorithm Visualiser' }
        ]
      }
    ]
  },
  {
    ref: '2.2', title: 'Programming Fundamentals', paper: 2,
    topics: [
      {
        ref: '2.2.1', title: 'Programming Fundamentals',
        subtopics: [
          'Variables', 'Constants', 'Operators',
          'Sequence/selection/iteration'
        ],
        simulations: []
      },
      {
        ref: '2.2.2', title: 'Data Types',
        subtopics: [
          'Integer', 'Real/float', 'Boolean', 'Character', 'String', 'Casting'
        ],
        simulations: []
      },
      {
        ref: '2.2.3', title: 'Additional Techniques',
        subtopics: [
          'String manipulation', 'Arrays', 'Functions/procedures',
          'File handling', 'Scope', 'SQL', 'Random numbers'
        ],
        simulations: [{ slug: 'sql-playground', name: 'SQL Query Playground' }]
      }
    ]
  },
  {
    ref: '2.3', title: 'Producing Robust Programs', paper: 2,
    topics: [
      {
        ref: '2.3.1', title: 'Defensive Design',
        subtopics: [
          'Input validation', 'Authentication',
          'Naming conventions', 'Comments'
        ],
        simulations: []
      },
      {
        ref: '2.3.2', title: 'Testing',
        subtopics: [
          'Logic/syntax errors', 'Iterative/terminal testing',
          'Normal/boundary/invalid/erroneous data'
        ],
        simulations: []
      }
    ]
  },
  {
    ref: '2.4', title: 'Boolean Logic', paper: 2,
    topics: [
      {
        ref: '2.4.1', title: 'Boolean Logic',
        subtopics: ['AND, OR, NOT gates', 'Truth tables', 'Logic diagrams'],
        simulations: [{ slug: 'boolean-logic', name: 'Boolean Logic Gate Simulator' }]
      }
    ]
  },
  {
    ref: '2.5', title: 'Languages and IDEs', paper: 2,
    topics: [
      {
        ref: '2.5.1', title: 'Languages',
        subtopics: ['High-level vs low-level', 'Compiler vs interpreter'],
        simulations: []
      },
      {
        ref: '2.5.2', title: 'The IDE',
        subtopics: ['Editor', 'Diagnostics', 'Breakpoints', 'Syntax highlighting'],
        simulations: []
      }
    ]
  }
];
