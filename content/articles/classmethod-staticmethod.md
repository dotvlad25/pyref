---
id: classmethod-staticmethod
title: classmethod & staticmethod
keywords: [classmethod, staticmethod, cls, self, alternative constructor, factory method, utility method, decorator, from_string, namespace]
category: OOP
related: [property, decorators, functools-cache]
---
# classmethod & staticmethod

Both are method [decorators](#decorators) that change what (if anything) is passed implicitly. Use `@classmethod` for **alternative constructors** (receives `cls`); use `@staticmethod` for **utility functions** that logically belong to the class but need neither instance nor class.

```python
class Pizza:
    def __init__(self, ingredients):
        self.ingredients = ingredients

    @classmethod
    def margherita(cls):                 # cls = the class (supports subclasses)
        return cls(["tomato", "mozzarella"])   # alt constructor

    @classmethod
    def from_string(cls, s):
        return cls(s.split(","))         # factory: build from another format

    @staticmethod
    def is_vegan(ingredients):           # no self, no cls — just grouped here
        return "cheese" not in ingredients

Pizza.margherita()                       # Pizza(['tomato', 'mozzarella'])
Pizza.from_string("ham,cheese")          # alt constructor
Pizza.is_vegan(["tomato"])               # True — call on class, no instance
```

| | Receives | Called on | Use for |
|---|---|---|---|
| instance method | `self` | instance | normal behavior |
| `@classmethod` | `cls` | class or instance | alt constructors / factories |
| `@staticmethod` | nothing | class or instance | namespaced helpers |

- `cls` respects inheritance: `SubPizza.margherita()` returns a `SubPizza`, since `cls` is the actual subclass. Hardcoding `Pizza(...)` instead would break subclasses (gotcha).
- `@staticmethod` is just a plain function living in the class namespace — no magic first arg.
- Common cue: "add a second way to build this object" ⇒ `@classmethod`.

See [property](#property) for computed attributes on the same class.
