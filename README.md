# Computing tSNE embeddings in streaming

> **Deprecated:** the npm packages needed are broken. Use this project only as inspiration 🙂

For more details read the [blog post](https://shapescience.xyz).
As explained, at the moment we only have "fake" streaming. Stay tuned.

![demo-app](https://raw.githubusercontent.com/shapescience/tsne-streaming/master/illustration.jpg)

## TODO
* Learn directly mappers: see [Learning a Parametric Embedding by Preserving Local Structure](https://lvdmaaten.github.io/publications/papers/AISTATS_2009.pdf)).
* Do real streaming like in [A-tSNE](https://arxiv.org/pdf/1512.01655.pdf).

## Server
### Install
For less trouble, setup `python3` with `anaconda`.
Missing packages can be installed with 'pip install X Y Z'

### Configuration
To use with your own data you'll need to define in `data.py`:
- how to load your data samples. We offer [digits](http://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html) by default. 
- which [pipeline](http://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html) you use for feature engineering.

Then you may want to change learners used in `embedding.py`. We use [SVR](http://scikit-learn.org/stable/modules/generated/sklearn.svm.SVR.html) at the moment. To do a seach for decent calibration run:

```bash
python embedding.py
```

Note that this tool can we used for real-time update of regression results, whatever that means.

### Run
```bash
python server.py
```

## Client
Have `nodejs` ready, and it should be as simple as:
```
cd app
npm install
npm start
```
If you want to change ports, etc, modify the *.webpack.config* files.
