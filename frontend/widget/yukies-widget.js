/**
 * YUKIES AI Shopping Companion & Customer Support Widget
 * Production-ready Web Component (Shadow DOM) for Shopify Dawn 7.0 (yukies.at).
 * 
 * Features:
 * - 100% Shadow DOM encapsulation (zero CSS conflicts with Shopify Dawn 7.0).
 * - Full Cross-Page Session Persistence (localStorage with 180-day GDPR retention).
 * - Floating Drawer (Desktop floating card + Mobile full drawer).
 * - Multilingual support (DE, EN, FR, IT) with instant in-widget switcher.
 * - Real-Time WebSockets for Live Agent Handoff (Silvia Ragucci & Barbara Bischof-Fünfrock).
 * - Zero Emojis & EU Cosmetics Law Compliance.
 */

const YUKIES_STORAGE_KEY = "yukies_chat_state_v1";
const RETENTION_DAYS = 180;

// Embedded Official YUKIES Mascot Bird Logo (yukies_vogel_dunkelblau)
const YUKIES_MASCOT_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAB3CAYAAAD1oOVhAAAQAElEQVR4Aex9C5ycRZXvOV/3DAkIK89kuidMzyTyCKBgEJLpiQwICL7wFffKKgu4yHX1urrqulyXxwp3L7rcFRG5cBcVhdW9O+i6yIIrKiOZRwIM8oygme6ZMNOTGIkuj2Qe3VX7/1d/1fNNT897JiGE/tX56tSpU6dOnVOvr76vuwN59TOvFli5cmX1ZAKnyn/VIZNZbxZ5mzZtGmaxJcsbj0g0NJ2ZTDVeWIT0atJ9PvFK8KpDKlllDrRkfdO6RH3jj2JGnxFr77Oq3yqCdCYa0j+vbUi/bTLx03DIuphIFCYTt+/mJVPp1YlU+mEr9l9E9B0i8lop/1g53Vj590R9+ovlWT49DYe0FESi4IuKFh3FuETbJ5FEfdPHrUonLLEqNMBIGJdHnn45R1J5JtNTOiRRt+YkVphoaLw2Ud94XaI+/TnOjYevbD6g6CioITKlHFb2SoRkfeMXROyNYdu8wavCdHlEuuPBSLohlWoeN4omNOTSFWsPX7p8zfclJo+IFm4Uq58X0c+oyJcVc2P1rpEnaxuarjpkxamvERETjhag+0RwdmPntKLXRFpMg0eSFVHy0ClLhyT/gXIOJ7icSGeIza8H/b0ATFlSDhb0OmvtlYsLweOJ+tXvxGghDeRXfKDNDGaMi9DSLwNmE+gUUbUfLi9M4eU08OX/EcSjAdzCYVHHOFETCABWjwEEYAFYo4I6kdhdWNR8TwmkuTmOsq+UoGFDfLsMRsZZYvUbIX2iiKNgojxPb6ppSJ+MROBnGCBIRsKSFavfAUOfBxJHhfMkcJBwrRzIZ7GoXYZdxj+BxUhrax6xbwjQvTqMth3tWroifRxacxdgqlAlVrrA9CygUnAOUyvvQiamfFwRxjkkVoh9IsBgCEHFBlh/AlHEDlCIlvaAJEcQBRZE5fxkfeN3BEQENiRATFZEe31Ae9bFgoLcjpYsArDNoAGrHK7O9bSfrFh3K2eXqG8CpgAXaDCH8IKhyGnqLcBZkTc0klMG8hJGrOiHE9iNRUqwMkKEtNeh1N8m6nP/G5q/AcDezfaSjuTYoCp/mcu2X0Fqfuf+9yB+GlAewtnHLq+tXUMHu/yiQ8I5X0XXgVqkiVjgGgIMjUEiElg1zwC2AJSAfPKxtwAVKlkQ9IpEqvGvpCgDEcaOOJC99GNrljfxHuNz0J/2oTHZbiRLgU4SWOlL/Zn2r/DMirBt209ewh17hxQ/RZ4iHl61NhaLY/vb4uRRuAjmRuZibnor4zIgYzVoL6qVC2sOHj6h2ux3DNz1bdAUAAeUjF2UB6KqXoubnw8BhbPWkQ/oXhuCwNqroT3bSqBNCMRBFhq6Cvb5QS7T8dckjDmzUt1J2gRQnQ/sEcijPKUBnbFql69ZAeIpgPLA/O2FwDb297R/u6ura6Snp3Uwl+28UFU4n8ZRgMIQwU0i4Sihk+xtifr0WYI7/VWrVpGPPHsd1KSazrZWzoXiCmD7ELkQiKK/qalC/HR+1wsXOGrZBXbKhKSqMC5FKga71jx2qs527g6blYg1wRvBxZGAaGxQDT64rbvjSRh1jMD+7s4LIObn4A4A7CV0DDQUymTvgS7yg2Sq8UQ6MizPPLDvPUEDG51+qTjbQGB7mRZM3x/atu3xl1wivPhRYo31DglzxkRWrS4Nt71uhLhcq7rSISLeoExqQeWO/sx6Gl1hVL+dpTIOBuP59xiVLJids0CkExA5Zws0fg1k38XjaJT3TgP7tAOdHQVfkHV4PBqTHvLzUNTpQVqUZyrc33NooqHpTDSiGQUogwDUBeK0FRPXDnRvfAQIaeUgVuX3yKsUhi3Us4E2hLNIjIrDZujR1iYjJUgrJtV+q4hUvu7YvPF5tfbCMJfyQrQU8eZyWcwo71GobCljWkhzM2Va8JoQBM49vrYhfS6MdT7gg0vr0ufWpppOXbYsnQBPkdeVa+EoZTnWGyCPMQHomMC8KIH3Uixrxdr/gYyiTIGdxH2YJsRByQXD8veOOtElCMaMnPFsusTTvCIU/keeGImfs6bwVCQ9Hl21qmog2/GAiN4gxdGFaEyoDlNnJuvS7GlhcppRa2sBRzmH1aaamjGX/0UCR9xwbheOCH4EY/0T4LtBIPcYtRsKcXk0WZ9+MJlKf7+mN39VIrX23YmG9JGoiU4hsJ1IwoxSgriM09uNLJtYseYk5PHGjU4kIOkC5VBe3lq5sa+vc6IR4JgDKy8AIT+iMaEo08qLpHYdeKANgFC4QL3DZPRTpIn0/Ta78bej5AoYFnlQdbja/g3iLYAJA2r7cjJ5yqEhA5Vh/WEyjIpbcOZJTd3qY3HSfH1QMF0w+P0407keenL7yemRDeTo4zTI3sz0YVD8TZgi3qtiv4CF9l/FymPYWPwCI+nisAawgBomEHEaRjQaVq58qrhwG/k4qOSnfKdTmEaEuUZkR2xYbmFiMtDhAkeIMzr4KA+RC0WZVlmfw51BUqnmRWrlcBn9uEJo1B9GSZNi9nfPtL9gAvu3KAhRbh0CWmq4x99oq6v9dpkK0IhOh6J09MzW1nwq1bwfHPFVDWKPidhPisgyESEvjU8DUh4bUY089nAvgzw0HnnIS+DIfzNG0jeS9ek7a+rTa1HGBWwyWNbh0QsW43xi+ZuXiQ3+GHTqSQDqAutmWtE5bp5qdLBEdfUwnbGDOIDlEbmg7hrYYxBbaW0tuIbk80P7g+tAEH1AUsRYfckTphNv7e64DQVbwUtj0ThOPtKRYN+G3vrfQPD5jKEYnIHtMXrz0cM6slGKjqDBOApoYPAIRwZplMs0xMAs4oA01ksgD3kJlM/yeej2HhT6Ber44bIVjQ1dxdEt+LAsolIwYgqXIPUaAMtSJtBSB4MYeV40diuJU0Em08Up63chH9QIMXF6o6/I/iIOxyQiIvAgexWwUoWuELQcJHEmoCqXkx8CsL8mNg4w8Ox1DQ2r2HPBRkXWoaqWwlIszuB+FHA8gDqx4X4UgOT0Yxni04UYGOkg1OFGLg18XqGgj9Wkmv4CeQx0GmMHeMZzEJA/BbAulmOMpKufOhG/Pdf9wEQHh8yPAuTb/wwJXlaYFFErh61YcS7bKaxMBgdlBFVxWEn0A3f5yqPkSfFcpr0Dsr4bMtGoIVqKaJDEoF3sdia17hynpZCsa1yDxfnfwEXFyAMUkjBUgEQbQZz5nI4IxAmsCw13RicPAUVLgW31jiHvAViTvpJoWPPTpanVqRIXkMX5+PmIuBkgH8sh6XRh7GwSqOHa4XASp4agUucullc5Yteu5zgaiw4pFA5V9FP2JIVgKkBATxbS2LDJAEXGBBjF8JhhCFSWRwTp4oBy4+I+9hIcrbwfc/CuWmxZbaD3gMwphjowDpD2gTTqANlOZ8ogD4E4gXWxDIHlaExOdywXBeYTSCPfW4JAH082rP4YE3V1a2uQ8VniAMpFNCYg2/6sL9P5BKheL9CcwyrFYGMwzCMSBbaH6cV20aL9iVAxWbx4mA3DM3KSRgHTD+mjhGlh62K5ns6nUfbmkJ29OETHRlbtV5Kp9KXYQf0YOThgw3V88I2mrjQ6OPRXmHi/qaKXo5d/Bqa4EkTO5+vh9n7g7Aw0ZjXwqQINdaAVvQmj5VcjgdkAGfUoZAGVAqqUO1xGs7tHcuhUF2uV+k/E1rO/HuB2s45pp+7aD5ycNxGNBmuE9FHCtLAW53WrsX8AO+fNiZ1qJWlV6LiJnAERmE4FJhK4QPROYGtz2baVuZ6Oj/Rn267pz3T8Q66n/Yu5bPslgDcHw+Z1OHfjM4bz0Cnulak/GmHhbodTFe0SpY+yWO1YeugQb3JFsCsazZgcgy5j7EDhBJaC5/s2b76XncgNf4lrnIZfzMwxoDKeNoahYgLyJcCC1wcTfj/kmHCUhPmTRRwVz4noeQPZtg9gjWqTMR/uzkaBUyDP3eCcu/oz7W9TK38O9m7AvIRCzFwa7s7oNLZ1unJp44q8cMzxicSq0SnLGLf9ZcPLCxzAM/1y4jTSHCXWxJRDm0pTeUebRlnyQ0fh/E/2X2NUvDGXbbsbCdIRRUNLgedAoxDNE8EJ9c01hwyuROf4FHL8xoV1EEAKg4WKhDBZFqEOaKHyBTo7zGN7QnRaURW52AAC8RCYNIP7xznFFkdIEKtmhYSQpxQdtHPnEc5zJcoMkK3d7fdjT/dLFHGVhjGiSQN5OXzRo/RpEwvejFGxBR2DDZqpEURw59/V1ZXHFHcDTMrtNB071hmTqiPcwcVR9n7oce3krJVzoTvXstJTwXIuKJPdsXkj71WKDqnKW1ZaqbGvzVcPjVvsywVOng6uC/Np6BCdNIJ+bu3KxfL2zK2b1z+HO+oq3D1zxFSQMTpdiRAvk93qXrigTIFBt+Sy7e/CNMYjkZfAqSLO4OyMjgc0BuKk0S5xbBqeqjZVfCWKeTOGF188hDY8eIKCWEalR4qfAONUZKjKKUUliuTR6wFmJHjNaHLmWC7T9v9RCnfezvnTWUtodKzL+t5nn23PoYcH6OG+XAUdW2C4KKC2KQKmsVuCwOD5j/4HWOMA2oEdkg4gECeNeW15zb+lp6eVx0jUDewzC9ZarsWHTFDKimov8izbykqBu7DLXcXdWHl6XI2lICriaSHbDKLAfFbFGEAgirYWAYoYAQ09xBCIkwfbysKf9fW00YkixR4+tjJMQyFBk8sbz6hJpT+F45CPpFLNbrfGESVTfPq6Ozfnsm3nqNV1amUD9FBAPASsp2abauEzuWz7WhywbgvF2TCeVhTqoSZm+YiWu1gDAahOMOiwqgmaLOyo1p0Wr3rhheLeeFE+NoIs7xAJPygrajXGs3riIXlmEZSK5bo7O9DaH6EkGipcHwxwBfgYqPBONgDx6/09G24jYQJQOKlQi0fOcEK7NfozyOa0eOuQ5h9I4Li9q6trBPVyzZlAxCi5P9txZ3+2s1FMcCZs8FXALTDVRVI1fEJ/ZgO37qPMM8R4nI4iVlSPcrHQ+MBGgxZR6xxO/oAEHC4OwWV+B0ISgcYC2XmX6VlBV1eDk6Oql1uRrRCCxVpIGwEOkrvPYJqLXmtftvMToE8W7OGp5iXGxO4H02oAZbD8iIo9Hgo/WtOQPplOwRQQR/60Qn9v+/39mc5PAf47O0Tu113+MHBa5SsytR5O3eBf4XMVGh/TqzAmO/OIGylYnt+R5jymfX21XDD98bDLwMUCRNTw6Ftm/2mhEvJsd8eTVSaOeVs4Umgo9mCOmGKscu/w4v3eOY16gmoduRGDvha81Jt6UgaBdf2RWrmrtnbNIRxJ4Jlh4MYgCjMsPoa9+GoPXLAyJFNXOiFMovuI9BUGD/y1I8CBHCFgcEar2CPAwDciHP9cL7296wdymc53iTVnQ7NPw6hXqcplVszZ6Jlv276ptXyUjqsSJ8JvRVnueBAJt5NQscRGR9MpNSYefA1U8iCaSaAtojCTsuN47YoV5+5nRXkUMy7TEaxs33bsMKdx+sGiWt/T1QAAEABJREFUMaV3prjSkwcZ8CkxgJWACxKw+Qu57Mb7BjKd1+cyG/62L9N5LdPTlR7EhOvFZOzUHzaQ87ngT8a4G/Ls84Udr8VUytHM6qgbwTIRwn9iJHNn5+iBNG8noqI4sAs5wgjOImZrliw5m/toJuYBotMB8emLTDakP41BfuwUJThK2EBrjbqX1qbgX9DsuAn44sVE9yAwu+VhqNeBI8ThcKL9jcNGL6FDpH7Rol0HjZLnikWnA+LTk3dE/alLrJUrK3Dz/sCAzqkKkQtcTxTYWbUNa05AvOdCLMYOxBFBoE5luijtXqIHGC5sCE7A7faQ0zuCjSQcOByYFSKc2mbWo0N5c4vCe44qifGBFp8yUnnqRbk7ghFzPBbxHyLBDQLbAtTt4hyOhjWDwDK+XUgueGAFrBNg+QI709TZ60AceaKilu9z0VkE8QyyK17IiBV/KuoyKYUQWDlOhMfq4a6BxN0FuDFM1qVPt6L+20Y2rFpxB3k5Tnf7jcr1MvajSBKwX9CL0JnYTm8EZC14YN1hJe4ehGmvN+nUh/Eu3Ck+CYT5iKTkEHWHWyoVX3nEbTQP5aICXeHddTGBXBGpi4blaGjrz3TcDLoOZNvb0Jn4/hgb6vVU5Fn0wZMS9c/674aTBvKCBl8HYxXr3ihhhUwzLoEVeXwg28FXp5iHpBTv1MMeZKE8FxhbKlFEMHVzhIw6r0jePdea1Jq3QtvTUJtbqBHT6IIjnb8CbnFHHmeMlvArZmAVOowxodgWDbhNBhunXbQS2O4IieVv4tugmF1cbdS7qI84HWFQ+xhySCMAFdBcVLyoVd79KlIlBuAKwlGpVDMXdtKRlN32UQ34HIN1Enh3L1bl5v7ejg081u7C0TqU0f5M4gaxwq+QBUhTTwJxJs88fGUzDklbuK5QDmgLFlgvwUihijfCrsNEamNeqFfQHqE7vcIMtzYEVm0rGMrPtECSxJAtNBDBaHIFi/jCXmvqVrNB54S1sF7eCG7TeBVfNbKbNh1HA1vkA7DGqXCEIzkmcMTUVg0Nvh1UyNido8TyaAfVVg7G5B8qzwkdUhxCuUz7FrHqHyh5XjZINDBngIAj4u1oFLDdEGKBXhxWw5EBoyNl7Vdyv259rnhO5Xq8YNqqQg71Knu8C6oPVi7DiAKf63zk9TkLFqtKJYewHVhbZNPBBzzPTRR1IY16lO5DRPwbFGq7kBNlYi8ESZp44REx44UGvkiHqendYT0c9lzIf5fXwrdB42uXXFOoJ78mQYcZawp3I688kAdt0NfvGD74deWZC5WurV2TRMUc4eVVgCxwgH08fOjGfNIYuzUEmcBbW91IgBE4bYEgjglbyjigAFiRSjUv6sLRtuyGz6CNnwLFkli9DWBYMYgDtd+MPJugFmBh44iKDPRu+BUIDyIF3QM4Aaf5Fr608ZjYQNUIv1pgkE9AtAChuTmOzh0vVAenGgn4ei50cfUwJkAvpIPgp7hGg2XCT1nESdCYxPgCGNeRAERHQ0xBRzwf38U5HMndEAL138vjSOCR/aANCjwwnKpyvp9FgxcbXuR2eGDlLPRcPr1je5jDNjKeLwjcjTbundTomRDq6wFaCughsivQwgMliox2qqhCzvh9RwZZSOkuYwZJDl1UiNeEdKZDdGGiXPeGdqjJV0vZgJ0q+sn+zRv7pqoN9yR0CO9+2Xn40IvO4JRmjej3cCPJzsa2UpThZR7ByXNnf2rPhVymfV1ICvVg3MUnlkQA0Xw3ZYEWCfAuOLiOSIQKEniDgOcydKJG8hYOHRo+X6w5xxh7XF+24x9REetGNFlYF8MDedydu8bzoRcdyhijvzCdX2CYTPjkeZyu0Nvj+79IZ/CFu0r8RlR/XimDtMoNVOU8TCfQ8IwJeLBl6BCHs/BCQy7XtZNH81t7Nvi3MsyUdeL0ehsehkmgp0N5biuzGGk/t0bf25ftZLumFDFrhlb3hgtXO36vhLaN2oo4dnlitWD4cgXUG18TC0WpLIQSwhcM2Pgx+VrcxoHH7eWj5V4+eGiUXPcDHf3Z9acMxoZPzPWsf8tAbxsPIBdczyXLG49QsTxZoP2iRofdXPXZKq3mrYVPO6K/jDF4SNRgcJg9MhemfWSslVWHHZ3GzgE3YSLRyuTl+sEZ3fOhbhUNEObNWxQYORvC/Nf2ovZ19WMX+7OenlaubdE8FCmGciILaX//g3wthYd15KKnyRfAA8l4QVeB6PgQvxrGWkBV5X0g0V7cTAAdE3AYov8OCkxZeZZhQeRHg2M0osppixkGFzqguEMwhsNRcXvMGzVkvRq8BZataGxQqzwMFVi8CoABIcQZx2DsnmobXy9Y+PE4gzYFOjaAZyzBp6yRDSHuFiLgRV6V04HjGK/4eg/wV0PRAoEpCL87yfscdt6owR2OKf+HmK74hJO2dLRi0dErM0ZTxLBLYVQwwldT+AIwHC0sTF4rVk86bBm/oN/CIck8sr8Krter/w1FbrVpEz+70HYiqjz2kfBDm4boaFRkHE2LhLuU325p48MqPs1iLg1PoJADY1XKaQt0flkT0atBkg1rz4AZXg+gjRBh9yvi7asg/rg/2/YYMkhDEliFwMwK5CIJEx9famNCeQkBuMVRNp6vh6MppO+bUTPOrtBya8zFiHzgyPC25UxicA53KzI9bcYOUR6QBVb5RUwKhxOkJATuPid5TO9rMZpYGfNQ13TDK4wPM8oyTOGq8s6wZbSXNzxJnL4yBy36Azs380p2ZGY5RAtG89zxNocYrM3DRkSlIVgQlUPyw9Xcb1M486Jl9zncxuz70Wjcn7njmnE2xWJ+e3jUzjzaDOyVAxkq54RUCOOLwBTiDU8cuQYLGKYtcdtkpPfZoFZLD9K8jaLGGIzFbfFLom7hj2aNx6d0SGDtI0HRBTwGpwSWwQjV05IrtuD01+22SN/XgMbXRH3jWTDPGwAFgAI4tzM2xPEs595nNyd58jEt+9C4kzKiVp7bF8DE42zWAZIwfbApxHiqiax9LtAGYaODvwwRbxsmuVaQh/At3ATSXsTJw/wJYUqH9Pd0PApJv8QosQRIQhJXBAxV/wICUvtM8O3XREM6jVmIPxzK2YO29Hl0SICh8tTSg4d5sjtt41DIVMyKsfddMLEyepjAcrhJlNP4zi3y9s1g7efDhhcdECYQMY1Ibw+/sETbIT11oGGn4rLxuOWWjSeUMY4SgAAMCh8akyq+sAYZXOARvcLDqlXu11VtTX3j+VL84xbBJ3qup0hzen+xYIN/CacrkKYXYNMpGfXZzR3d4GoDMHCEMGbFFmf/F9bVrfWL+3TksexeC11dXSOcFVT0q2Ej/HTl7cL1wuLW4M5tvQ/0gkcBDJaXqWBKAxZ7xLqYtdoSCmMFFM6yHJqHjATmT4p5+8YWOKbxq9BevolP4wOF+XkVd69G++QxfVwHEu2DaPqBRp2Umz2Cwy4YGebvlvDbotEyrFygDp9hC/lw2SNhd1Va05A+Wa18FPVxmmL7o/agA/jc6O+3bm7fJDLzaTwqDHVMHPDQ6jko8s2Qg8fLRKlQHruJlYlU45UgMI3oFRu4c7oRraPdOEsARXfkVWAFkTiu3UPVEv4Eh3tLknyEItcU12CK/DHZRu0tIPBInosWK6EDCEZUr1ra0Hgy8l9xYdWqVXwmJDWp9HVo7KloINtOACoguamKuKjqZfxBUIwO2tbzuLzpXFhoOnyOZyDb0atqOUqoBEcJK6QMLmyFwOr/c4yvoAudwWk7kVr7blXxv9HIdvtWEjdIBKLyQ5z/tfBgFtM3aSDPLAQzY+e4VP66AX+YjKOExekc9iAqcGKiPs33p0h/RQCdsQynuTgC4exAe7Gd0bYxHQdhZz6vn8XIiIWn4CDNPLCCGZXKZdr7AlX/FbK8wb4XIAC+A8ze8mfJev6VHMXOfFFjqZcZBCYuN0Anfj18GHF58DutK4sP9VqYph08lPNPmp6xQyDNxE2cixb/NYYjA6SxwYpek6xvugDDFsrtdU5R15rm4oOnZCr9YSvuTRKSORIYe+C0TdoDuWw7t7mePut4Ng6Rnp7WIQnMRyrVipFiAWLFfhtnPU17o1NW8h+f8eAJneoNuPP16yKnpvIms0P2j9gqvqlYnjer9KwcgnkyyPEXfqx8bIJa2XPgE7l9b3MKnOF+LA1r4dFoAH9EsxptxCDBdXwYCSR4x/ae1q2wSQzZs7QnSoZhlgLcPOl+zzCwchNAASMAxoKYPYc9qg5D5RfJVPrS4kgJa32ZRnBGNZ7sjSRTjSdCRR4V4UgILUACgVMZgTbDVCyKHef/7Muufxx5CM4mbDPw2QcKn31plMTcyZ9T4u/uViPJkUGlgQp7DBUPMOy/jh53K4hzrg8yFiSEzhiurV97glVtRSWHiQi380DHBC7sVVb0of5MB3ecYzLnmpgXAw1XCx7nysNQxo8MoEJneKdYED4Cp2ysXe7+68q9RAEa61fEezR4Z0C/o42Yn0AZfuPY64/kmMCOtytQ4Q8ZzLvuNMiY2maRUN6ZwilnYHB3oTxl+sbQEXQKdyKkrTImeAhH138ira1MM5+NYhnGKL7bg2KaGl6yvPF41Hw/wP+CHvVGslKw7+7PtPE3SiplzolGQ8xJAArTqAGc8uLwfsLXTDlS2BgO96iRSaMTXqui30Fv/FYq1cwTU5YnqIiU66OgLXSwiYami2NG+Z1xrhlcB6gHdWLd1KGE47ZrXS7bcR8zFgJY8XzIRSPWwSmJnSOLq+AUezeEclSADow3+EVgfaSxgX86rCNPJVNrLsEOhXTQ3PE9cULUEE7IfF8SdWtOSqTSPxNrvwHZnKaoG+uGLqAUA9dF0vidx7P7sx089S7mLMCVFc2HWBiPu4wWs31T6070oHfC/v8HgjkqEIkfLeDDxCZuJLChS60GtyRSOf4t0cePPHLAG4WGUZ4jsfDcgDemUShKw6i4SoKgS1TOAIW6sE7aI+oMZAnXxa2BBI3YwNyH9YZp0hcEqMBcBSsEeGBjXMPglM+JKh9cuV0JeNho8sWAk48jCKgURIW/B/K1fMw+ifXl6uSKU90vsHXh6RwZ5gYtheKWuxhzVCTr0w9iVFwRyqVe1Im2oF4huRTtEGtO7+P2trk5jvWG/KXM+UaoxFxlshF0AmMvi2nNZdq+ZwrBSVaUbz+yZ3Gk2JDJx9SBOKFGRf/GFuJP1+Cou6Zu9bEhryKOApKlwPJRKGUAUf4AQbKh6aiahvRlWLfWY1R0oCI+JqAulBknHwBkXDG0cWUe0y+IMWfmejqfFjgjshFhngewz19gQ+ZP2lhJzilbt6zfFBspnIpRcBuyfePZyyaqm8Y4QFU+rUHs8Zr69AYY8oZkKv3RmtSas7FtXg45MCSnIWAirCcKQkcmG9KfRrn/GLSLHrPWPoqHa38H7kbAfgAG6mKJlAFpVaIyEKhpyvV2/jLijDLW+U9OZJT5qomGEn43PJdpvyg0X0sAAAiWSURBVMiK4sBRfg/h3hgFA9NGAXmcPixiQgzZpwD/hFW5WTW4F9vmDTX1TY8lGnKPJ+sbv5NoaLoK8RcQfylRn74D8BAc+ai1wpu2s1CWX09ehJjyNFoXcdDLQ0ysfDee1xP6Mp1P7E5nUJGFdgjrKMFAtu32WF6OV7G8a+coqSplToxgDRCOGgJxbJvt8TDaSstfmbP2SsTXiLV8HYlr1kkQRaeSl4DktEObGjkj19P+oS1b2vhNJw2nqagA9BEhRGkzwidj3q0OoSLPPtuew9bx0iAwx8GofAGPZMvLBEDjRoE6k5+jjwanowgjKE9gfhRAnjI8B4EfxS7qtP7edh6bRAsgC5rKOIjyzBtOxedN2AwEaV93Zzd7Isp0AagHGw50WoE9lMBynP4IHG0E0qMwpUCMig8MZNt5LzIl70IzsEELXUe5fBqLNMYqan/FBIAOUcTlgaOAoyEK5C0HX478UfD0ieLntGD4fcqJ8ncrfU84ZGwDDfY/RQoNXsRGr88B5TRUPmVFHcdyBE5bhCgvcYiQAV72BthTDvG92wSiQwFSHmA0GheRrF+kgysCCVZbte/HSPoSiD8WNb2A3wOGAChuFHEsBE5dYBMuyA9g6f1iYIPTc3VVdSryU4DG8NQJIAALAMnoUDzPESXhB9qMWS9C8u6Jgt1TzSS1WGGvrsQwmMl0Pd+HO+SBTMf3c5mOv8ai+/ZcpnO5aP7EwJrVImYtLHqetXqBqr1YVD8IQWdLEHs9eE/LZdqv6utZvx47JXjNfc3bGxtsYQhkqBAPeE4VEvZstMcdooHh0UolK/DPyGBvoY6MCc6gue6H+vqyG5/IZTa29Wc67x7Idtze373htlx3xz/nsu335Ub/o5b8Trax8oJDxPV+XqzLtDKyo3axd4gjhXx7JGJj90jFvlJYpfIIsUrdOH0RPDtjOmYmwDKCAr0OCR0S4oKMqoYtL8zjnw3InD5s9JwEzLmwKv8tbZwY3Jn79YB57Lke6CAPzJscmt3foxqsQxkIgP8ljphl2HasKHLYkNmvngQ8BogV4z13pVJ7rnZXc2mX5VL+otZOxzi07eTQGv64pzH8q+0hLz8SV9vA+kPMCHnPoLN3yHzpa4S/gThOmlUtjCPOjsDRJGbwIP7Guv/trFFJNsCpS4zH/3TsKH0PYXveIWorTlkqtlJvnq2ZdNu2n+wStZV++bqA9YXH8bOVPa/l9oRDXE/E08DiGmEt//uKvZhp5hFgI8nNU0spi6KwXuhvDFJRQAZsYFPFuMUKn3uIO9oHJ5Z8GQeykB8os5DiK8oO2Oiu8GmgFeXxOhvvma1DrGRdPJ8XFf4qhVT4HFVT13Seo7fyhyxbOF1SD4WusTHgnEWHeXCl5u2yJxxicaOWr61f+/qa+qYWPIj6VNgaOsWDxZT1DOjUz9MYgzT7YI3hj0+WC6Bc1cD+APo8imcrt+DZysW1qaZTlyw5ezF0NYBCCYS/N1kCOq5c3pzSwZxKz6IwnpcnE6mmm4yYR2D091cQEQdNbaCbEbOXRgGk2YdgpPCwWNlRJqEkH/ocb0U/ilX+Gzhi2xDb/6UnEvVNd9U0pG9K1qevqannY+CmP0+k0h9I1jWuTiZP8T92WSZy9smFcgjlEqgZe6AccWRTAx7D/h2elz+JxfVjyGA+Dw6BiuMB4nvcH3RohKfAFrR5C/39D+7A+dUvcG7G+lgX43L51IlrGun1uI88BxvzS6HI58H8v5D+GrT9HjpMh62uegaOujNRt4YPxcgPFkazBxpl9qUrluTcKmyQOWTFqQcl6pvekWho+l48Zp/APHQZihwIYD7aKLzXYEzgHTuNhGx5AsbjSS/1YyM9MG9OULDCp5WUwToZl4MboSAynwDUtYcx9SONwDYcDOR9EgQPh/+ZiCTZZg9s8OxLVyzZYpam1p6WqE//86JC1VPoUf+GKYDfn+DZFBtUXoo6sHE0RDX4fyPGRL/Lx0Z6KC874/TW3vZ74d07MEqqACPA0eEnFUP9ouCL+Nhtz63Rr2PnyAdkkwqbKpMVTcUzo3w44quBGj4GhRMs/1SRTiBQDkcE4yhwZJD+IpzxyVw2eax708PtZjDjRzlnh3tn+lj766ouwrTJX7qeswGh0n4AAzimf/v+r0M8pzAfDmFPoRytqW+8Gtp8HGCw1ycI4oBAGoCOofIEGojlAMpfzDk5l+34WvGlNnCK23oSmW9wu7xcpuM9qPgSuJw/9onNnjiIVEYdqa8Hpj1Qd4Jn5+h+YT+V33vCbGPoNNuipXJQzL2TiyVC+Z8ZpYwQ8XWwMeB1x+lsAB25RUUvymXbzsll27nNDYvsnqgv236r5s0J8MTbUePVYuUeFfH3P9SbenrgKPYANpQQ8W2ycOf/7e1dv9VR53BhpXMo7opCOdebsRnRPowGBeSRQ9kWMXct4BHfMNJ7YITPFnYesLI/2/Yd8Oyx0NfXuasv035Pf7b9iv6e9rdX2apVphBg+2svgFLXAVpwRMwfA30YjXgSaf46HJ/hsB10EL8ifk0u08afamJ7wTL7QKGzL10s6ZWwgbE3gQS9BYszMHG7KD9P74DHfmDxODYYMSv7M+3X43zJPxhyzHvmwl3hKPT0tD7Pty0Hsh135LLtnwP88QAchfhNi2MHnTyyuOoEYwvHSGDSgdXVJhYchbwr5kv3+XBISZf+3vb7rdV3idhHQNylYvmlltvghPOh+DHoge8bwONY9MpB5CvgZRA4uqMg7GDUjbYhEHewefO9Q9s3tb64tWdDT667s6Ovp23j1s3r/X8Iz0tbWOG8CPJCtmXb7t6a6TgZe/M6HRw6cWum/aJteLQKxXmIyPrYOLL7+Zf4ywnoEAL188A0daTuHtgWAunzBvMuEJpReQsHbOc/5CDtDhMRsyFsoMtHem8LXm8fsy2EeW3HfwEAAP//+jGp4AAAAAZJREFUAwDF/vA6mhsTjwAAAABJRU5ErkJggg==";

const UI_STRINGS = {
  de: {
    brandName: "YUKIES WIEN",
    brandSubtitle: "Naturkosmetik Manufaktur",
    launcherText: "YUKIES Beratung",
    proactiveGreeting: "Brauchst du Beratung? YUKIES ist für dich da!",
    statusAi: "KI-Beraterin aktiv",
    statusWaiting: "An Silvia & Barbara übergeben (Antwort < 4 Std.)",
    statusAgent: "In Chat mit",
    prechatTitle: "Willkommen bei YUKIES",
    prechatIntro:
      "Trage bitte kurz deinen Namen ein, damit wir dich persönlich zu unseren Naturkosmetik-Produkten beraten können.",
    nameLabel: "Vor- und Nachname *",
    namePlaceholder: "z. B. Maria Berger",
    trainingNotice:
      "Dieser Assistent befindet sich in der Trainingsphase. Antworten werden automatisch erzeugt, können Fehler enthalten und sind unverbindlich.",
    consentLabel:
      "Ich akzeptiere die Nutzungsbedingungen und die Datenschutzrichtlinie (DSGVO & österreichisches DSG). Name und Chatverlauf werden für 6 Monate (180 Tage) gespeichert. *",
    startBtn: "Beratung starten",
    inputPlaceholder: "Frage zu Produkten, Inhaltsstoffen oder Bestellung...",
    sendBtn: "Senden",
    viewProductBtn: "Auf yukies.at ansehen",
    showProductsPrompt: "Möchtest du passende Produkte dazu ansehen?",
    hideProductsPrompt: "Produkte ausblenden",
    inStock: "Vorrätig",
    outOfStock: "Ausverkauft",
    loggedInBadge: "Kundin:",
    guestBadge: "Gast:",
    newChatBtn: "Neuer Chat",
    closeBtn: "Schließen",
    quickPrompts: [
      "Welche Pflege empfiehlst du für die Schwangerschaft?",
      "Warum ist mein Sugar Scrub braun geworden?",
      "Welche Produkte eignen sich ab der Geburt?",
      "Wie hoch sind die Versandkosten?",
    ],
    aiTyping: "YUKIES Beraterin tippt...",
  },
  en: {
    brandName: "YUKIES VIENNA",
    brandSubtitle: "Natural Cosmetics Manufactory",
    launcherText: "YUKIES Advisor",
    proactiveGreeting: "Need any guidance? YUKIES is here for you!",
    statusAi: "AI Shopping Advisor active",
    statusWaiting: "Forwarded to our team (Reply < 4 hrs)",
    statusAgent: "Connected with",
    prechatTitle: "Welcome to YUKIES",
    prechatIntro:
      "Please enter your name so we can assist you personally with our handmade skincare products.",
    nameLabel: "Full Name *",
    namePlaceholder: "e.g. Emma Miller",
    trainingNotice:
      "This assistant is still in its training phase. Replies are generated automatically, may contain errors, and are not binding.",
    consentLabel:
      "I accept the Terms of Use and Privacy Policy (EU GDPR & Austrian DSG). My name and chat history are stored for 6 months (180 days). *",
    startBtn: "Start Consultation",
    inputPlaceholder: "Ask about products, ingredients, or orders...",
    sendBtn: "Send",
    viewProductBtn: "View on yukies.at",
    showProductsPrompt: "Would you like to see recommended products?",
    hideProductsPrompt: "Hide products",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    loggedInBadge: "Customer:",
    guestBadge: "Guest:",
    newChatBtn: "New Chat",
    closeBtn: "Close",
    quickPrompts: [
      "What do you recommend during pregnancy?",
      "Why did my Sugar Scrub turn brown?",
      "Which baby products can be used from birth?",
      "What are the shipping costs?",
    ],
    aiTyping: "YUKIES Advisor is typing...",
  },
  fr: {
    brandName: "YUKIES VIENNE",
    brandSubtitle: "Manufacture de Cosmétiques Naturels",
    launcherText: "Conseil YUKIES",
    proactiveGreeting: "Besoin de conseils ? YUKIES est là pour vous !",

    statusAi: "Conseillère IA active",
    statusWaiting: "Transmis à notre équipe (Réponse < 4h)",
    statusAgent: "En chat avec",
    prechatTitle: "Bienvenue chez YUKIES",
    prechatIntro:
      "Veuillez indiquer votre nom pour commencer votre consultation personnalisée.",
    nameLabel: "Nom complet *",
    namePlaceholder: "ex. Claire Martin",
    trainingNotice:
      "Cet assistant est encore en phase d'apprentissage. Les réponses sont générées automatiquement, peuvent contenir des erreurs et ne sont pas contractuelles.",
    consentLabel:
      "J'accepte les Conditions d'utilisation et la Politique de confidentialité (RGPD & loi autrichienne DSG). Mon nom et l'historique de chat sont conservés pendant 6 mois (180 jours). *",
    startBtn: "Commencer la consultation",
    inputPlaceholder: "Posez votre question sur nos produits ou votre commande...",
    sendBtn: "Envoyer",
    viewProductBtn: "Voir sur yukies.at",
    showProductsPrompt: "Souhaitez-vous voir les produits recommandés ?",
    hideProductsPrompt: "Masquer les produits",
    inStock: "En stock",
    outOfStock: "Épuisé",
    loggedInBadge: "Cliente :",
    guestBadge: "Invitée :",
    newChatBtn: "Nouveau chat",
    closeBtn: "Fermer",
    quickPrompts: [
      "Quels soins pour la grossesse et l'allaitement ?",
      "Quels produits pour bébé dès la naissance ?",
      "Quels sont les délais de livraison ?",
    ],
    aiTyping: "La conseillère YUKIES répond...",
  },
  it: {
    brandName: "YUKIES VIENNA",
    brandSubtitle: "Manifattura Cosmetica Naturale",
    launcherText: "Consulenza YUKIES",
    proactiveGreeting: "Hai bisogno di aiuto? YUKIES è qui per te!",
    statusAi: "Assistente IA attiva",
    statusWaiting: "Inoltrato al team (Risposta < 4 ore)",
    statusAgent: "In chat con",
    prechatTitle: "Benvenuta da YUKIES",
    prechatIntro:
      "Inserisci il tuo nome per ricevere una consulenza personalizzata sui nostri cosmetici naturali.",
    nameLabel: "Nome e Cognome *",
    namePlaceholder: "es. Giulia Rossi",
    trainingNotice:
      "Questo assistente è ancora in fase di addestramento. Le risposte sono generate automaticamente, possono contenere errori e non sono vincolanti.",
    consentLabel:
      "Accetto i Termini di utilizzo e l'Informativa sulla privacy (GDPR e legge austriaca DSG). Il mio nome e la cronologia chat vengono conservati per 6 mesi (180 giorni). *",
    startBtn: "Inizia consulenza",
    inputPlaceholder: "Fai una domanda sui prodotti o sul tuo ordine...",
    sendBtn: "Invia",
    viewProductBtn: "Vedi su yukies.at",
    showProductsPrompt: "Desideri vedere i prodotti consigliati?",
    hideProductsPrompt: "Nascondi prodotti",
    inStock: "Disponibile",
    outOfStock: "Esaurito",
    loggedInBadge: "Cliente:",
    guestBadge: "Ospite:",
    newChatBtn: "Nuova chat",
    closeBtn: "Chiudi",
    quickPrompts: [
      "Quali prodotti consigliate in gravidanza?",
      "Quali prodotti per neonati dalla nascita?",
      "A quanto ammontano i costi di spedizione?",
    ],
    aiTyping: "L'assistente YUKIES sta scrivendo...",
  },
};

class YukiesChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.apiBase = this.getAttribute("api-base") || window.location.origin;
    this.isInline = this.getAttribute("mode") === "inline";
    this.position = this.getAttribute("position") || "bottom-right";

    // Language resolution
    const shopLocale = (window.YukiesCustomer && window.YukiesCustomer.locale) || "de";
    this.lang = UI_STRINGS[shopLocale] ? shopLocale : "de";

    this.session = null;
    this.ws = null;
    this.isSending = false;
    this.unreadCount = 0;
    this.expandedProducts = new Set();
    this.showProactive = false;
    this.proactiveTimer = null;

    // Load persistent state from localStorage
    this.state = this.loadPersistentState();
    this.isOpen = this.isInline ? true : (this.state.is_open || this.getAttribute("default-open") === "true");
    if (this.state.locale && UI_STRINGS[this.state.locale]) {
      this.lang = this.state.locale;
    }
  }

  connectedCallback() {
    this.isInline = this.getAttribute("mode") === "inline";
    if (this.isInline) this.isOpen = true;

    // 5-second proactive greeting popup for visitors
    if (!this.isInline && !this.isOpen && !sessionStorage.getItem("yukies_proactive_dismissed")) {
      this.proactiveTimer = setTimeout(() => {
        if (!this.isOpen && !this.isInline && !sessionStorage.getItem("yukies_proactive_dismissed")) {
          this.showProactive = true;
          this.render();
          this.bindEvents();
        }
      }, 5000);
    }

    // If persistent session is stored, hydrate immediately
    if (this.state.session && this.state.session.user_id) {
      this.session = this.state.session;
      this.connectWebSocket(this.session.conversation_id);
    }

    this.render();
    this.bindEvents();

    // Verify session or auto-initialize if Shopify customer is logged in
    this.ensureSession().then(() => {
      this.render();
      this.bindEvents();
      this.scrollToBottom();
    });

    // Listen for customer auth changes
    window.addEventListener("yukies-customer-changed", () => {
      this.handleCustomerIdentityChange();
    });
  }

  disconnectedCallback() {
    if (this.proactiveTimer) {
      clearTimeout(this.proactiveTimer);
      this.proactiveTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Cross-Page Session Persistence (localStorage)
  // ---------------------------------------------------------------------------

  loadPersistentState() {
    try {
      const raw = localStorage.getItem(YUKIES_STORAGE_KEY);
      if (!raw) return { is_open: false, session: null, locale: this.lang };
      const parsed = JSON.parse(raw);

      // Check GDPR retention (180 days)
      if (parsed.timestamp) {
        const ageDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
        if (ageDays > RETENTION_DAYS) {
          localStorage.removeItem(YUKIES_STORAGE_KEY);
          return { is_open: false, session: null, locale: this.lang };
        }
      }
      return parsed;
    } catch (_) {
      return { is_open: false, session: null, locale: this.lang };
    }
  }

  savePersistentState() {
    try {
      const data = {
        is_open: this.isInline ? false : Boolean(this.isOpen),
        locale: this.lang,
        timestamp: Date.now(),
        session: this.session
          ? {
              user_id: this.session.user_id,
              conversation_id: this.session.conversation_id,
              full_name: this.session.full_name,
              email: this.session.email,
              is_logged_in_shopify: this.session.is_logged_in_shopify,
              status: this.session.status,
              assigned_agent: this.session.assigned_agent,
              messages: (this.session.messages || []).slice(-30), // keep recent 30 messages
            }
          : null,
      };
      localStorage.setItem(YUKIES_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("YUKIES localStorage save error:", err);
    }
  }

  clearPersistentState() {
    try {
      localStorage.removeItem(YUKIES_STORAGE_KEY);
    } catch (_) {}
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.session = null;
    this.state = { is_open: this.isOpen, session: null, locale: this.lang };
    this.render();
    this.bindEvents();
  }

  async handleCustomerIdentityChange() {
    const cust = window.YukiesCustomer;
    // If logged-in customer changed or logged out
    if (cust && cust.id) {
      if (!this.session || this.session.shopify_customer_id !== String(cust.id)) {
        this.clearPersistentState();
        await this.ensureSession();
      }
    } else {
      // Switched to guest mode
      if (this.session && this.session.is_logged_in_shopify) {
        this.clearPersistentState();
      }
    }
    this.render();
    this.bindEvents();
  }

  // ---------------------------------------------------------------------------
  // Backend Session Initialization
  // ---------------------------------------------------------------------------

  async ensureSession() {
    const cust = window.YukiesCustomer;
    const isCustomerLoggedIn = Boolean(cust && cust.id && cust.email);

    if (isCustomerLoggedIn) {
      await this.initBackendSession({
        shopify_customer_id: String(cust.id),
        full_name: cust.full_name || "Kundin",
        email: cust.email,
        gdpr_consent: true,
        language: this.lang,
        conversation_id: this.session ? this.session.conversation_id : null,
      });
    } else if (this.session && this.session.user_id && this.session.full_name) {
      // Resume existing guest session (guests no longer submit an email,
      // so the locally cached user_id is the resume key)
      await this.initBackendSession({
        shopify_customer_id: null,
        user_id: this.session.user_id,
        full_name: this.session.full_name,
        email: this.session.email || null,
        gdpr_consent: true,
        language: this.lang,
        conversation_id: this.session.conversation_id,
      });
    }
  }

  async initBackendSession(payload) {
    try {
      const res = await fetch(`${this.apiBase}/api/chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      const data = await res.json();

      // If resuming existing session with cached messages, merge smartly
      if (this.session && this.session.messages && this.session.messages.length > 0) {
        const serverIds = new Set(data.messages.map((m) => m.id));
        const merged = [...data.messages];
        for (const localMsg of this.session.messages) {
          if (!serverIds.has(localMsg.id)) {
            merged.push(localMsg);
          }
        }
        data.messages = merged;
      }

      this.session = data;
      this.savePersistentState();
      this.connectWebSocket(this.session.conversation_id);
    } catch (err) {
      console.error("YUKIES session init error:", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Real-Time WebSockets
  // ---------------------------------------------------------------------------

  connectWebSocket(conversationId) {
    if (!conversationId) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      const wsProto = this.apiBase.startsWith("https") ? "wss" : "ws";
      const hostPart = this.apiBase.replace(/^https?:\/\//, "");
      this.ws = new WebSocket(`${wsProto}://${hostPart}/ws/chat/${conversationId}`);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!this.session) return;

          if (data.status) this.session.status = data.status;
          if ("assigned_agent" in data) this.session.assigned_agent = data.assigned_agent;

          if (data.message && (data.event === "human_agent_message" || data.event === "agent_takeover")) {
            const exists = this.session.messages.some((m) => m.id === data.message.id);
            if (!exists) {
              this.session.messages.push(data.message);
              if (!this.isOpen && !this.isInline) {
                this.unreadCount += 1;
              }
            }
          }
          this.savePersistentState();
          this.render();
          this.bindEvents();
          this.scrollToBottom();
        } catch (e) {
          console.error("YUKIES WS message error:", e);
        }
      };

      this.ws.onclose = () => {
        // Reconnect after 3 seconds if conversation still active
        setTimeout(() => {
          if (this.session && this.session.conversation_id) {
            this.connectWebSocket(this.session.conversation_id);
          }
        }, 3000);
      };
    } catch (err) {
      console.warn("YUKIES WebSocket connect warning:", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Message Handling
  // ---------------------------------------------------------------------------

  async sendMessage(text) {
    if (!text || !text.trim() || !this.session || this.isSending) return;
    const cleanText = text.trim();
    this.isSending = true;

    const tempId = "temp-" + Date.now();
    this.session.messages.push({
      id: tempId,
      sender_type: "customer",
      sender_name: this.session.full_name,
      content: cleanText,
      referenced_products: [],
      created_at: new Date().toISOString(),
    });
    this.savePersistentState();
    this.render();
    this.bindEvents();
    this.scrollToBottom();

    try {
      const res = await fetch(`${this.apiBase}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: this.session.user_id,
          conversation_id: this.session.conversation_id,
          message: cleanText,
          language: this.lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        this.session.status = data.status;
        this.session.assigned_agent = data.assigned_agent;

        // Replace optimistic message with persistent message from backend
        const idx = this.session.messages.findIndex((m) => m.id === tempId);
        if (idx !== -1) {
          this.session.messages[idx] = data.customer_message;
        } else {
          this.session.messages.push(data.customer_message);
        }

        if (data.reply_message) {
          const already = this.session.messages.some((m) => m.id === data.reply_message.id);
          if (!already) {
            this.session.messages.push(data.reply_message);
          }
        }

        if (data.handover_triggered) {
          this.dispatchShopifyContactNotification(data);
        }
        this.savePersistentState();
      }
    } catch (err) {
      console.error("YUKIES sendMessage error:", err);
    } finally {
      this.isSending = false;
      this.render();
      this.bindEvents();
      this.scrollToBottom();
    }
  }

  async dispatchShopifyContactNotification(data) {
    if (this._contactDispatched) return;
    this._contactDispatched = true;

    try {
      const isShopifyStore =
        typeof window.Shopify !== "undefined" ||
        window.location.hostname.includes("yukies") ||
        window.location.hostname.includes("myshopify.com");

      if (!isShopifyStore) return;

      const customerName = (this.session && this.session.full_name) || "YUKIES Shop-Besucherin";
      const customerEmail = (this.session && this.session.email) || "guest@yukies.at";
      const reason = (data && data.handover_reason) || "Kundenanfrage zur persönlichen Beratung";

      const lastMessages = (this.session && this.session.messages ? this.session.messages : [])
        .slice(-6)
        .map((m) => `[${m.sender_name || m.sender_type}]: ${m.content}`)
        .join("\n");

      const messageBody = [
        "==================================================",
        "YUKIES AI Assistent - Übergabe an Silvia & Barbara",
        "==================================================",
        `Kundin/Kunde: ${customerName}`,
        `E-Mail: ${this.session && this.session.email ? this.session.email : "Nicht angegeben (Gast - Antwort via Live-Chat)"}`,
        `Sprache: ${(this.lang || "de").toUpperCase()}`,
        `Grund der Übergabe: ${reason}`,
        `DSGVO User-ID: ${this.session ? this.session.user_id : ""}`,
        `Conversation-ID: ${this.session ? this.session.conversation_id : ""}`,
        "",
        "Bisheriger Gesprächsverlauf:",
        lastMessages,
        "",
        "---",
        "Live-Chat Admin-Konsole zum Antworten:",
        `${this.apiBase}/admin`,
      ].join("\n");

      const formData = new FormData();
      formData.append("form_type", "contact");
      formData.append("utf8", "✓");
      formData.append("contact[name]", customerName);
      formData.append("contact[email]", customerEmail);
      formData.append("contact[body]", messageBody);

      await fetch("/contact#contact_form", {
        method: "POST",
        body: formData,
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
    } catch (e) {
      console.warn("Shopify contact dispatch info:", e);
    }
  }

  toggleOpen() {
    if (this.isInline) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      this.showProactive = false;
      sessionStorage.setItem("yukies_proactive_dismissed", "true");
      if (this.proactiveTimer) {
        clearTimeout(this.proactiveTimer);
        this.proactiveTimer = null;
      }
    }
    this.savePersistentState();
    this.render();
    this.bindEvents();
    if (this.isOpen) {
      this.scrollToBottom();
      setTimeout(() => {
        const input = this.shadowRoot.getElementById("yukies-chat-input");
        if (input) input.focus();
      }, 150);
    }
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      const body = this.shadowRoot.querySelector(".yukies-messages");
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    });
  }

  escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------------------------------------------------------------------------
  // UI Rendering & Styling
  // ---------------------------------------------------------------------------

  renderStatusBadge(t) {
    if (!this.session) {
      return `<span class="yukies-status-badge">${this.escapeHtml(t.brandSubtitle)}</span>`;
    }
    if (this.session.status === "agent_active" && this.session.assigned_agent) {
      return `<span class="yukies-status-badge" style="background: var(--accent);">${this.escapeHtml(t.statusAgent)} ${this.escapeHtml(this.session.assigned_agent)}</span>`;
    }
    if (this.session.status === "waiting_for_agent") {
      return `<span class="yukies-status-badge" style="background: var(--brand-pink-soft);">${this.escapeHtml(t.statusWaiting)}</span>`;
    }
    return `<span class="yukies-status-badge">${this.escapeHtml(t.statusAi)}</span>`;
  }

  renderProductCards(message, t) {
    if (!message) return "";
    const cards = Array.isArray(message) ? message : (message.referenced_products || []);
    if (!cards || !cards.length) return "";

    const msgId = message.id || message.created_at || "msg_default";
    const isExpanded = Boolean(this.expandedProducts && this.expandedProducts.has(msgId));
    const count = cards.length;

    return `
      <div class="yukies-product-reco-wrap">
        <button
          type="button"
          class="yukies-show-products-btn ${isExpanded ? "expanded" : ""}"
          data-msg-id="${this.escapeHtml(msgId)}"
          aria-expanded="${isExpanded ? "true" : "false"}"
        >
          <span>${isExpanded ? t.hideProductsPrompt : `${t.showProductsPrompt} (${count})`}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        ${
          isExpanded
            ? `
          <div class="yukies-product-cards">
            ${cards
              .map(
                (p) => `
              <div class="yukies-product-card">
                ${
                  (() => {
                    const catalogImg =
                      window.YukiesProductCatalog &&
                      window.YukiesProductCatalog[p.handle] &&
                      window.YukiesProductCatalog[p.handle].image;
                    const finalImg = catalogImg || p.image_url;
                    return finalImg
                      ? `<img src="${this.escapeHtml(finalImg)}" class="yukies-product-thumb" alt="${this.escapeHtml(p.title)}" loading="lazy" onerror="this.style.display='none'" />`
                      : `<div class="yukies-product-thumb-placeholder">
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                             <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                             <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                             <line x1="12" y1="22.08" x2="12" y2="12"/>
                           </svg>
                         </div>`;
                  })()
                }
                <div class="yukies-product-content">
                  <div class="yukies-product-top">
                    <div class="yukies-product-meta">
                      <span class="yukies-product-cert">${this.escapeHtml(p.certification || "COSMOS ORGANIC")}</span>
                      <span class="yukies-product-title">${this.escapeHtml(p.title)}</span>
                      <span class="yukies-product-size">${this.escapeHtml(p.size)}</span>
                    </div>
                    <div class="yukies-product-pricing">
                      ${p.compare_at_price ? `<span class="yukies-price-compare">${this.escapeHtml(p.compare_at_price)}</span>` : ""}
                      <span class="yukies-price-val">${this.escapeHtml(p.price)}</span>
                      <span class="yukies-stock-badge ${p.available ? "in-stock" : "out-stock"}">
                        ${p.available ? t.inStock : t.outOfStock}
                      </span>
                    </div>
                  </div>
                  <p class="yukies-product-desc">${this.escapeHtml(p.short_description)}</p>
                  <a class="yukies-product-btn" href="${this.escapeHtml(p.product_url)}" target="_blank" rel="noopener noreferrer">
                    <span>${t.viewProductBtn}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </a>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  render() {
    const t = UI_STRINGS[this.lang] || UI_STRINGS.de;
    const isIdentified = Boolean(this.session && this.session.user_id);
    const isCustomer = Boolean(this.session && this.session.is_logged_in_shopify);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* Palette (Brand Navy & Periwinkle Scale v2.2) */
          --background: #FAFAFA;
          --card: #FFFFFF;
          --muted: #F4F4F5;
          --foreground: #0D1D3A;        /* Brand Navy — متن اصلی و هدینگ */
          --muted-foreground: #71717A;  /* متن فرعی و توضیح */

          /* Actions */
          --primary: #0D1D3A;           /* دکمه‌های اصلی و حباب پیام کاربر */
          --primary-foreground: #F4F6FC;
          --primary-hover: #152656;
          --primary-active: #1F3474;
          --secondary: #CED5F1;         /* Periwinkle accent */
          --accent: #E4E8F8;            /* هاور سافت، چیپ‌ها، هایلایت ملایم */
          --brand-pink-soft: #FEE7F3;   /* بج‌ها و دکمه‌های ثانویه ملایم */
          --brand-pink: #FAB9DA;
          --brand-cream: #FCFAE9;

          /* Borders & Focus */
          --border: #E4E4E7;
          --border-hover: #A1A1AA;
          --input: #D4D4D8;
          --ring: #152656;

          /* Feedback */
          --feedback-success: #2F6B51;
          --feedback-success-bg: #EAF4EE;
          --feedback-error: #B42318;
          --feedback-error-bg: #FCEBED;

          /* Typography (Shopify theme inherited - Zero Google Fonts CDN for GDPR) */
          --font-heading: "Epilogue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          --font-sans: "Arimo", "Helvetica Neue", Helvetica, Arial, sans-serif;
          --font-serif-accent: "Instrument Serif", Georgia, serif;

          /* Geometry */
          --radius-card: 0px;           /* کارت محصول و قاب عکس‌های ادیتوریال */
          --radius-panel: 20px;         /* پنجره‌های شناور، مودال و سرچ‌دراپ‌داون */
          --radius-control: 24px;       /* دکمه‌ها و اینپوت‌ها */
          --radius-control-hover: 16px; /* تغییر نرم شعاع در هاور */
          --radius-pill: 9999px;        /* چیپ‌ها و Pill Button */

          /* Shadows & Motion */
          --shadow-floating: 0 20px 44px rgba(13, 29, 58, 0.12);
          --shadow-pill: 0 2px 8px rgba(13, 29, 58, 0.25);
          --backdrop-blur: blur(12px);
          --motion-fast: 150ms ease-in-out;
          --motion-normal: 200ms ease-in-out;

          font-family: var(--font-sans);
          color: var(--foreground);
          display: block;
          -webkit-font-smoothing: antialiased;
        }

        .yukies-italic {
          font-family: var(--font-serif-accent);
          font-style: italic;
          font-weight: 400;
        }

        /* ------------------------------------------------------------- */
        /* Floating Circular Launcher Button (.yukies-btn-pill pattern)   */
        /* ------------------------------------------------------------- */
        .yukies-launcher-bubble {
          position: fixed;
          ${this.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
          bottom: 24px;
          z-index: 450;
          display: ${this.isInline ? "none" : "flex"};
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: var(--radius-pill);
          background: var(--card);
          border: 1.5px solid var(--primary);
          cursor: pointer;
          box-shadow: var(--shadow-pill);
          padding: 0;
          transition: transform var(--motion-normal), box-shadow var(--motion-normal), background var(--motion-normal), border-color var(--motion-normal);
        }
        .yukies-launcher-bubble:hover {
          transform: translateY(-2px) scale(1.04);
          background: var(--muted);
          border-color: var(--primary-hover);
          box-shadow: var(--shadow-floating);
        }
        .yukies-launcher-bubble:active {
          transform: scale(0.96);
        }
        .yukies-launcher-mascot {
          width: 36px;
          height: 36px;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }
        .yukies-pulse-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--feedback-success);
          border: 2px solid var(--card);
          box-shadow: 0 0 0 0 rgba(47, 107, 81, 0.7);
          animation: yk-pulse 2s infinite;
        }
        @keyframes yk-pulse {
          0% { box-shadow: 0 0 0 0 rgba(47, 107, 81, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(47, 107, 81, 0); }
          100% { box-shadow: 0 0 0 0 rgba(47, 107, 81, 0); }
        }
        .yukies-unread-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--feedback-error);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          line-height: 1;
          padding: 3px 6px;
          border-radius: var(--radius-pill);
          border: 2px solid var(--card);
        }

        /* ------------------------------------------------------------- */
        /* Proactive 5-Second Greeting Speech Bubble                     */
        /* ------------------------------------------------------------- */
        .yukies-proactive-popup {
          position: fixed;
          ${this.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
          bottom: 96px;
          z-index: 450;
          max-width: 275px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-panel);
          box-shadow: var(--shadow-floating);
          padding: 12px 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          animation: yk-popup-bounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transition: transform var(--motion-normal), box-shadow var(--motion-normal);
        }
        .yukies-proactive-popup:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 48px rgba(13, 29, 58, 0.16);
        }
        .yukies-proactive-popup::after {
          content: "";
          position: absolute;
          bottom: -9px;
          ${this.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 9px solid var(--border);
        }
        @keyframes yk-popup-bounce {
          0% { opacity: 0; transform: translateY(14px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .yukies-proactive-close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 16px;
          line-height: 1;
          color: var(--muted-foreground);
          cursor: pointer;
          padding: 2px 5px;
          border-radius: 50%;
          transition: color var(--motion-fast), background var(--motion-fast);
        }
        .yukies-proactive-close:hover {
          color: var(--foreground);
          background: var(--muted);
        }
        .yukies-proactive-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-right: 16px;
        }
        .yukies-proactive-avatar {
          width: 28px;
          height: 28px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .yukies-proactive-text {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
          color: var(--foreground);
        }

        /* ------------------------------------------------------------- */
        /* Drawer Window (.yukies-header-search__dropdown & modal spec)  */
        /* ------------------------------------------------------------- */
        .yukies-drawer {
          ${
            this.isInline
              ? `
            position: relative;
            width: 100%;
            height: 620px;
            display: flex;
          `
              : `
            position: fixed;
            ${this.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
            bottom: 86px;
            width: 390px;
            max-width: calc(100vw - 32px);
            height: 640px;
            max-height: calc(100vh - 110px);
            display: ${this.isOpen ? "flex" : "none"};
            z-index: 450;
            animation: yk-drawer-open 0.24s cubic-bezier(0.16, 1, 0.3, 1);
          `
          }
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-panel);
          box-shadow: var(--shadow-floating);
          flex-direction: column;
          overflow: hidden;
        }
        @keyframes yk-drawer-open {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 680px) {
          .yukies-drawer {
            ${
              this.isInline
                ? ""
                : `
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              width: 100vw;
              max-width: 100vw;
              height: 100vh;
              max-height: 100vh;
              border-radius: 20px 20px 0 0;
              border: none;
              z-index: 450;
            `
            }
          }
        }

        /* ------------------------------------------------------------- */
        /* Header (.yukies-cart-drawer__header pattern)                  */
        /* ------------------------------------------------------------- */
        .yukies-header {
          background: var(--card);
          color: var(--foreground);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }
        .yukies-header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .yukies-brand-avatar {
          width: 32px;
          height: 32px;
          object-fit: contain;
          background: var(--muted);
          border-radius: 50%;
          padding: 2px;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }
        .yukies-brand-title {
          font-family: var(--font-heading);
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--foreground);
          display: flex;
          align-items: baseline;
          gap: 4px;
          white-space: nowrap;
        }
        .yukies-brand-sub {
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .yukies-status-badge {
          background: var(--brand-pink-soft);
          color: var(--foreground);
          padding: 3px 8px;
          border-radius: var(--radius-pill);
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .yukies-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .yukies-lang-pills {
          display: flex;
          background: var(--muted);
          border-radius: var(--radius-pill);
          padding: 2px;
          border: 1px solid var(--border);
        }
        .yukies-lang-btn {
          background: transparent;
          color: var(--muted-foreground);
          border: none;
          padding: 4px 7px;
          font-size: 10.5px;
          font-weight: 600;
          font-family: var(--font-sans);
          border-radius: var(--radius-pill);
          cursor: pointer;
          line-height: 1;
          transition: background var(--motion-fast), color var(--motion-fast);
        }
        .yukies-lang-btn.active {
          background: var(--primary);
          color: var(--primary-foreground);
        }
        .yukies-icon-btn {
          background: transparent;
          border: none;
          color: var(--foreground);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--motion-fast), color var(--motion-fast);
        }
        .yukies-icon-btn:hover {
          background: var(--muted);
        }

        /* ------------------------------------------------------------- */
        /* User Profile Status Bar                                       */
        /* ------------------------------------------------------------- */
        .yukies-user-status-bar {
          background: var(--background);
          border-bottom: 1px solid var(--border);
          padding: 7px 16px;
          font-size: 11.5px;
          color: var(--muted-foreground);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .yukies-user-id-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
          background: var(--muted);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border);
          color: var(--foreground);
        }

        /* ------------------------------------------------------------- */
        /* Messages Body                                                 */
        /* ------------------------------------------------------------- */
        .yukies-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--background);
        }
        .yukies-bubble {
          max-width: 86%;
          padding: 11px 14px;
          font-size: 14px;
          font-family: var(--font-sans);
          line-height: 1.5;
          word-break: break-word;
          position: relative;
        }
        .yukies-bubble.ai {
          align-self: flex-start;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px 18px 18px 4px;
          color: var(--foreground);
          box-shadow: 0 1px 3px rgba(13, 29, 58, 0.04);
        }
        .yukies-bubble.customer {
          align-self: flex-end;
          background: var(--primary);
          color: var(--primary-foreground);
          border-radius: 18px 18px 4px 18px;
        }
        .yukies-bubble.human_agent {
          align-self: flex-start;
          background: var(--accent);
          border: 1px solid var(--secondary);
          border-radius: 18px 18px 18px 4px;
          color: var(--foreground);
        }
        .yukies-bubble.system {
          align-self: center;
          background: var(--muted);
          color: var(--muted-foreground);
          font-size: 11.5px;
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--border);
          max-width: 90%;
          text-align: center;
        }
        .yukies-agent-title {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* ------------------------------------------------------------- */
        /* Quick Prompt Suggestions (.yukies-home-pill pattern)          */
        /* ------------------------------------------------------------- */
        .yukies-quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .yukies-quick-chip {
          height: 38px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          font-size: 12.5px;
          font-family: var(--font-sans);
          font-weight: 500;
          color: var(--foreground);
          cursor: pointer;
          transition: background var(--motion-normal), color var(--motion-normal), border-color var(--motion-normal), transform var(--motion-normal), box-shadow var(--motion-normal);
        }
        .yukies-quick-chip:hover {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-pill);
        }

        /* ------------------------------------------------------------- */
        /* On-Demand Product Recommendations (.yukies-header-search__item)*/
        /* ------------------------------------------------------------- */
        .yukies-product-reco-wrap {
          margin-top: 10px;
        }
        .yukies-show-products-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          font-size: 12px;
          font-family: var(--font-sans);
          font-weight: 500;
          color: var(--foreground);
          cursor: pointer;
          transition: background var(--motion-fast), border-color var(--motion-fast), box-shadow var(--motion-fast);
        }
        .yukies-show-products-btn:hover {
          background: var(--muted);
          border-color: var(--border-hover);
        }
        .yukies-show-products-btn svg {
          transition: transform var(--motion-normal);
        }
        .yukies-show-products-btn.expanded svg {
          transform: rotate(180deg);
        }
        .yukies-product-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        .yukies-product-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          transition: background var(--motion-fast), border-color var(--motion-fast), transform var(--motion-fast), box-shadow var(--motion-fast);
        }
        .yukies-product-card:hover {
          background: var(--background);
          border-color: var(--border-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 29, 58, 0.06);
        }
        .yukies-product-thumb {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          background: #FFFFFF;
          object-fit: contain;
          padding: 3px;
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .yukies-product-thumb-placeholder {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted-foreground);
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .yukies-product-content {
          flex: 1;
          min-width: 0;
        }
        .yukies-product-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .yukies-product-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .yukies-product-cert {
          font-size: 9.5px;
          text-transform: uppercase;
          color: var(--feedback-success);
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .yukies-product-title {
          font-family: var(--font-heading);
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 1px;
          white-space: normal;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .yukies-product-size {
          font-size: 11px;
          color: var(--muted-foreground);
        }
        .yukies-product-pricing {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .yukies-price-compare {
          font-size: 10.5px;
          text-decoration: line-through;
          color: var(--muted-foreground);
        }
        .yukies-price-val {
          font-size: 13.5px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--foreground);
        }
        .yukies-stock-badge {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 2px;
          font-weight: 600;
        }
        .yukies-stock-badge.in-stock {
          background: var(--feedback-success-bg);
          color: var(--feedback-success);
        }
        .yukies-stock-badge.out-stock {
          background: var(--feedback-error-bg);
          color: var(--feedback-error);
        }
        .yukies-product-desc {
          font-size: 11.5px;
          color: var(--muted-foreground);
          margin: 4px 0 6px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .yukies-product-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          background: var(--primary);
          color: var(--primary-foreground);
          padding: 5px 12px;
          border-radius: var(--radius-control);
          text-decoration: none;
          transition: background var(--motion-fast), transform var(--motion-fast);
        }
        .yukies-product-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        /* ------------------------------------------------------------- */
        /* Chat Input Footer (Sticky Control Pill pattern)               */
        /* ------------------------------------------------------------- */
        .yukies-footer {
          padding: 12px 14px;
          background: var(--card);
          border-top: 1px solid var(--border);
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .yukies-input-box {
          flex: 1;
          border: 1px solid var(--input);
          border-radius: var(--radius-control);
          padding: 11px 16px;
          font-size: 13.5px;
          outline: none;
          background: var(--background);
          color: var(--foreground);
          box-sizing: border-box;
          font-family: var(--font-sans);
          transition: border-color var(--motion-fast), box-shadow var(--motion-fast), background var(--motion-fast);
        }
        .yukies-input-box:focus {
          border-color: var(--ring);
          background: var(--card);
          box-shadow: 0 0 0 3px rgba(21, 38, 86, 0.12);
        }
        .yukies-send-button {
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: var(--radius-control);
          height: 42px;
          padding: 0 18px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background var(--motion-fast), transform var(--motion-fast);
        }
        .yukies-send-button:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }
        .yukies-send-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ------------------------------------------------------------- */
        /* Pre-Chat Form (DSGVO Consent)                                 */
        /* ------------------------------------------------------------- */
        .yukies-prechat-wrap {
          padding: 24px 22px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--card);
        }
        .yukies-prechat-wrap h3 {
          margin: 0 0 6px 0;
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 700;
          color: var(--foreground);
        }
        .yukies-prechat-wrap p {
          margin: 0 0 16px 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--muted-foreground);
        }
        .yukies-form-group {
          margin-bottom: 12px;
        }
        .yukies-form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--foreground);
          margin-bottom: 5px;
        }
        .yukies-form-group input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 16px;
          border: 1px solid var(--input);
          border-radius: var(--radius-control);
          background: var(--background);
          color: var(--foreground);
          font-size: 13.5px;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
        }
        .yukies-form-group input:focus {
          border-color: var(--ring);
          background: var(--card);
          box-shadow: 0 0 0 3px rgba(21, 38, 86, 0.12);
        }
        .yukies-training-notice {
          margin: 2px 0 14px 0 !important;
          padding: 10px 12px;
          background: var(--brand-cream);
          border: 1px solid #F0ECD0;
          border-radius: 12px;
          font-size: 11px !important;
          line-height: 1.45 !important;
          color: var(--foreground) !important;
        }
        .yukies-consent-row {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 10px 0 16px 0;
          font-size: 11px;
          line-height: 1.45;
          color: var(--muted-foreground);
          cursor: pointer;
        }
        .yukies-consent-row input[type="checkbox"] {
          margin-top: 2px;
          cursor: pointer;
          accent-color: var(--primary);
        }
        .yukies-start-btn {
          width: 100%;
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: var(--radius-control);
          padding: 13px;
          font-size: 13.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background var(--motion-fast), transform var(--motion-fast);
        }
        .yukies-start-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }
      </style>

      <!-- Proactive Greeting Popup -->
      ${
        this.showProactive && !this.isOpen && !this.isInline
          ? `
        <div class="yukies-proactive-popup" id="yk-proactive-popup" role="status">
          <button class="yukies-proactive-close" id="yk-proactive-close" title="${this.escapeHtml(t.closeBtn)}" aria-label="${this.escapeHtml(t.closeBtn)}">&times;</button>
          <div class="yukies-proactive-content">
            <img src="${YUKIES_MASCOT_DATA_URI}" class="yukies-proactive-avatar" alt="YUKIES" />
            <div class="yukies-proactive-text">${this.escapeHtml(t.proactiveGreeting)}</div>
          </div>
        </div>
      `
          : ""
      }

      <!-- Floating Circular Launcher Button (Only Logo) -->
      <button class="yukies-launcher-bubble" id="yk-launcher" aria-label="YUKIES Chat" title="YUKIES">
        <img src="${YUKIES_MASCOT_DATA_URI}" class="yukies-launcher-mascot" alt="YUKIES" />
        <span class="yukies-pulse-dot"></span>
        ${this.unreadCount > 0 ? `<span class="yukies-unread-badge">${this.unreadCount}</span>` : ""}
      </button>

      <!-- Drawer Panel -->
      <div class="yukies-drawer" role="dialog" aria-label="YUKIES Chat">
        <div class="yukies-header">
          <div class="yukies-header-brand">
            <img src="${YUKIES_MASCOT_DATA_URI}" class="yukies-brand-avatar" alt="YUKIES Mascot" />
            <div>
              <div class="yukies-brand-title">YUKIES <span class="yukies-italic">${this.lang === "de" ? "Wien" : (this.lang === "en" ? "Vienna" : "Wien")}</span></div>
              <div class="yukies-brand-sub">${this.renderStatusBadge(t)}</div>
            </div>
          </div>
          <div class="yukies-header-actions">
            <div class="yukies-lang-pills">
              <button class="yukies-lang-btn ${this.lang === "de" ? "active" : ""}" data-lang="de">DE</button>
              <button class="yukies-lang-btn ${this.lang === "en" ? "active" : ""}" data-lang="en">EN</button>
              <button class="yukies-lang-btn ${this.lang === "fr" ? "active" : ""}" data-lang="fr">FR</button>
              <button class="yukies-lang-btn ${this.lang === "it" ? "active" : ""}" data-lang="it">IT</button>
            </div>
            ${
              isIdentified
                ? `<button class="yukies-icon-btn" id="yk-new-chat-btn" title="${this.escapeHtml(t.newChatBtn)}">
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                     </svg>
                   </button>`
                : ""
            }
            <button class="yukies-icon-btn" id="yk-close-btn" title="${this.escapeHtml(t.closeBtn)}">&times;</button>
          </div>
        </div>

        ${
          isIdentified
            ? `
          <div class="yukies-user-status-bar">
            <span>${isCustomer ? t.loggedInBadge : t.guestBadge} <strong>${this.escapeHtml(this.session.full_name)}</strong></span>
            <span class="yukies-user-id-code">DSGVO ID: ${this.escapeHtml(this.session.user_id.slice(0, 8))}</span>
          </div>

          <div class="yukies-messages">
            ${this.session.messages
              .map(
                (m) => `
              <div class="yukies-bubble ${this.escapeHtml(m.sender_type)}">
                ${
                  m.sender_type === "human_agent"
                    ? `<div class="yukies-agent-title">${this.escapeHtml(m.sender_name)} (YUKIES Team)</div>`
                    : ""
                }
                <div>${this.escapeHtml(m.content)}</div>
                ${this.renderProductCards(m, t)}
              </div>
            `
              )
              .join("")}

            ${
              this.session.messages.length <= 1
                ? `
              <div class="yukies-quick-prompts">
                ${t.quickPrompts
                  .map(
                    (qp) =>
                      `<button class="yukies-quick-chip" data-prompt="${this.escapeHtml(qp)}">${this.escapeHtml(qp)}</button>`
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${this.isSending ? `<div class="yukies-bubble system">${this.escapeHtml(t.aiTyping)}</div>` : ""}
          </div>

          <form class="yukies-footer" id="yk-chat-form">
            <input
              type="text"
              class="yukies-input-box"
              id="yukies-chat-input"
              placeholder="${this.escapeHtml(t.inputPlaceholder)}"
              autocomplete="off"
              ${this.isSending ? "disabled" : ""}
            />
            <button type="submit" class="yukies-send-button" ${this.isSending ? "disabled" : ""}>
              ${this.escapeHtml(t.sendBtn)}
            </button>
          </form>
        `
            : `
          <form class="yukies-prechat-wrap" id="yk-prechat-form">
            <h3>${this.escapeHtml(t.prechatTitle)}</h3>
            <p>${this.escapeHtml(t.prechatIntro)}</p>

            <div class="yukies-form-group">
              <label for="yk-input-name">${this.escapeHtml(t.nameLabel)}</label>
              <input type="text" id="yk-input-name" required placeholder="${this.escapeHtml(t.namePlaceholder)}" />
            </div>

            <p class="yukies-training-notice">${this.escapeHtml(t.trainingNotice)}</p>

            <label class="yukies-consent-row">
              <input type="checkbox" id="yk-input-consent" required />
              <span>${this.escapeHtml(t.consentLabel)}</span>
            </label>

            <button type="submit" class="yukies-start-btn">${this.escapeHtml(t.startBtn)}</button>
          </form>
        `
        }
      </div>
    `;
  }

  bindEvents() {
    // Proactive greeting popup events
    const proactivePopup = this.shadowRoot.getElementById("yk-proactive-popup");
    if (proactivePopup) {
      proactivePopup.onclick = (e) => {
        if (e.target && e.target.id === "yk-proactive-close") return;
        this.showProactive = false;
        sessionStorage.setItem("yukies_proactive_dismissed", "true");
        this.toggleOpen();
      };
    }
    const proactiveClose = this.shadowRoot.getElementById("yk-proactive-close");
    if (proactiveClose) {
      proactiveClose.onclick = (e) => {
        e.stopPropagation();
        this.showProactive = false;
        sessionStorage.setItem("yukies_proactive_dismissed", "true");
        this.render();
        this.bindEvents();
      };
    }

    const launcher = this.shadowRoot.getElementById("yk-launcher");
    if (launcher) launcher.onclick = () => this.toggleOpen();

    const closeBtn = this.shadowRoot.getElementById("yk-close-btn");
    if (closeBtn) closeBtn.onclick = () => this.toggleOpen();

    const newChatBtn = this.shadowRoot.getElementById("yk-new-chat-btn");
    if (newChatBtn) {
      newChatBtn.onclick = () => {
        if (confirm("Möchtest du eine neue Beratung starten? Der bisherige Chatverlauf wird archiviert.")) {
          this.clearPersistentState();
          this.ensureSession().then(() => {
            this.render();
            this.bindEvents();
          });
        }
      };
    }

    // Language pills
    const langBtns = this.shadowRoot.querySelectorAll(".yukies-lang-btn");
    langBtns.forEach((btn) => {
      btn.onclick = () => {
        const selected = btn.getAttribute("data-lang");
        if (selected && UI_STRINGS[selected]) {
          this.lang = selected;
          this.savePersistentState();
          this.render();
          this.bindEvents();
        }
      };
    });

    // Guest pre-chat submission
    const prechatForm = this.shadowRoot.getElementById("yk-prechat-form");
    if (prechatForm) {
      prechatForm.onsubmit = async (e) => {
        e.preventDefault();
        const nameEl = this.shadowRoot.getElementById("yk-input-name");
        const consentEl = this.shadowRoot.getElementById("yk-input-consent");
        if (!nameEl.value.trim() || !consentEl.checked) return;

        await this.initBackendSession({
          shopify_customer_id: null,
          full_name: nameEl.value.trim(),
          email: null,
          gdpr_consent: true,
          language: this.lang,
        });
        this.render();
        this.bindEvents();
        this.scrollToBottom();
      };
    }

    // Chat message form submission
    const chatForm = this.shadowRoot.getElementById("yk-chat-form");
    if (chatForm) {
      chatForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = this.shadowRoot.getElementById("yukies-chat-input");
        if (!input || !input.value.trim()) return;
        const val = input.value;
        input.value = "";
        await this.sendMessage(val);
      };
    }

    // Quick prompt chips
    const quickChips = this.shadowRoot.querySelectorAll(".yukies-quick-chip");
    quickChips.forEach((chip) => {
      chip.onclick = () => {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt) this.sendMessage(prompt);
      };
    });

    // Toggle on-demand product recommendations
    const prodToggleBtns = this.shadowRoot.querySelectorAll(".yukies-show-products-btn");
    prodToggleBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const msgId = btn.getAttribute("data-msg-id");
        if (!msgId) return;
        if (this.expandedProducts.has(msgId)) {
          this.expandedProducts.delete(msgId);
        } else {
          this.expandedProducts.add(msgId);
        }
        this.render();
        this.bindEvents();
        this.scrollToBottom();
      };
    });
  }
}

if (!customElements.get("yukies-chat-widget")) {
  customElements.define("yukies-chat-widget", YukiesChatWidget);
}
